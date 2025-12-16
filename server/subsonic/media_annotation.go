package subsonic

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/navidrome/navidrome/core/scrobbler"
	"github.com/navidrome/navidrome/log"
	"github.com/navidrome/navidrome/model"
	"github.com/navidrome/navidrome/model/request"
	"github.com/navidrome/navidrome/server/events"
	"github.com/navidrome/navidrome/server/subsonic/responses"
	"github.com/navidrome/navidrome/utils/req"
)

func (api *Router) SetRating(r *http.Request) (*responses.Subsonic, error) {
	p := req.Params(r)
	id, err := p.String("id")
	if err != nil {
		return nil, err
	}
	rating, err := p.Int("rating")
	if err != nil {
		return nil, err
	}

	log.Debug(r, "Setting rating", "rating", rating, "id", id)
	err = api.setRating(r.Context(), id, rating)
	if err != nil {
		log.Error(r, err)
		return nil, err
	}

	return newResponse(), nil
}

func (api *Router) setRating(ctx context.Context, id string, rating int) error {
	var repo model.AnnotatedRepository
	var resource string

	entity, err := model.GetEntityByID(ctx, api.ds, id)
	if err != nil {
		return err
	}
	switch entity.(type) {
	case *model.Artist:
		repo = api.ds.Artist(ctx)
		resource = "artist"
	case *model.Album:
		repo = api.ds.Album(ctx)
		resource = "album"
	default:
		repo = api.ds.MediaFile(ctx)
		resource = "song"
	}
	err = repo.SetRating(rating, id)
	if err != nil {
		return err
	}
	event := &events.RefreshResource{}
	api.broker.SendMessage(ctx, event.With(resource, id))
	return nil
}

func (api *Router) Star(r *http.Request) (*responses.Subsonic, error) {
	p := req.Params(r)
	ids, _ := p.Strings("id")
	albumIds, _ := p.Strings("albumId")
	artistIds, _ := p.Strings("artistId")
	if len(ids)+len(albumIds)+len(artistIds) == 0 {
		return nil, newError(responses.ErrorMissingParameter, "Required id parameter is missing")
	}
	ids = append(ids, albumIds...)
	ids = append(ids, artistIds...)

	err := api.setStar(r.Context(), true, ids...)
	if err != nil {
		return nil, err
	}

	return newResponse(), nil
}

func (api *Router) Unstar(r *http.Request) (*responses.Subsonic, error) {
	p := req.Params(r)
	ids, _ := p.Strings("id")
	albumIds, _ := p.Strings("albumId")
	artistIds, _ := p.Strings("artistId")
	if len(ids)+len(albumIds)+len(artistIds) == 0 {
		return nil, newError(responses.ErrorMissingParameter, "Required id parameter is missing")
	}
	ids = append(ids, albumIds...)
	ids = append(ids, artistIds...)

	err := api.setStar(r.Context(), false, ids...)
	if err != nil {
		return nil, err
	}

	return newResponse(), nil
}

func (api *Router) setStar(ctx context.Context, star bool, ids ...string) error {
	if len(ids) == 0 {
		return nil
	}
	log.Debug(ctx, "Changing starred", "ids", ids, "starred", star)
	if len(ids) == 0 {
		log.Warn(ctx, "Cannot star/unstar an empty list of ids")
		return nil
	}
	event := &events.RefreshResource{}
	err := api.ds.WithTxImmediate(func(tx model.DataStore) error {
		for _, id := range ids {
			exist, err := tx.Album(ctx).Exists(id)
			if err != nil {
				return err
			}
			if exist {
				err = tx.Album(ctx).SetStar(star, id)
				if err != nil {
					return err
				}
				event = event.With("album", id)
				continue
			}
			exist, err = tx.Artist(ctx).Exists(id)
			if err != nil {
				return err
			}
			if exist {
				err = tx.Artist(ctx).SetStar(star, id)
				if err != nil {
					return err
				}
				event = event.With("artist", id)
				continue
			}
			err = tx.MediaFile(ctx).SetStar(star, id)
			if err != nil {
				return err
			}
			event = event.With("song", id)
		}
		api.broker.SendMessage(ctx, event)
		return nil
	})
	if err != nil {
		log.Error(ctx, err)
		return err
	}
	return nil
}

func (api *Router) Scrobble(r *http.Request) (*responses.Subsonic, error) {
	p := req.Params(r)
	ids, err := p.Strings("id")
	if err != nil {
		return nil, err
	}
	times, _ := p.Times("time")
	if len(times) > 0 && len(times) != len(ids) {
		return nil, newError(responses.ErrorGeneric, "Wrong number of timestamps: %d, should be %d", len(times), len(ids))
	}
	submission := p.BoolOr("submission", true)
	position := p.IntOr("position", 0)
	ctx := r.Context()

	if submission {
		err := api.scrobblerSubmit(ctx, ids, times)
		if err != nil {
			log.Error(ctx, "Error registering scrobbles", "ids", ids, "times", times, err)
		}
	} else {
		err := api.scrobblerNowPlaying(ctx, ids[0], position)
		if err != nil {
			log.Error(ctx, "Error setting NowPlaying", "id", ids[0], err)
		}
	}

	return newResponse(), nil
}

func (api *Router) scrobblerSubmit(ctx context.Context, ids []string, times []time.Time) error {
	var submissions []scrobbler.Submission
	log.Debug(ctx, "Scrobbling tracks", "ids", ids, "times", times)
	for i, id := range ids {
		var t time.Time
		if len(times) > 0 {
			t = times[i]
		} else {
			t = time.Now()
		}
		submissions = append(submissions, scrobbler.Submission{TrackID: id, Timestamp: t})
	}

	return api.scrobbler.Submit(ctx, submissions)
}

func (api *Router) scrobblerNowPlaying(ctx context.Context, trackId string, position int) error {
	log.Info(ctx, "Scrobbling Now Playing", "id", trackId, "position", position)
	mf, err := api.ds.MediaFile(ctx).Get(trackId)
	if err != nil {
		return err
	}
	if mf == nil {
		return fmt.Errorf(`ID "%s" not found`, trackId)
	}

	player, _ := request.PlayerFrom(ctx)
	username, _ := request.UsernameFrom(ctx)
	user, ok := request.UserFrom(ctx)
	if !ok {
		log.Warn(ctx, "No user in context for scrobbling Now Playing", "id", trackId)
	}
	client, _ := request.ClientFrom(ctx)
	clientId, ok := request.ClientUniqueIdFrom(ctx)
	if !ok {
		clientId = player.ID
	}

	log.Info(ctx, "Now Playing", "title", mf.Title, "artist", mf.Artist, "user", username, "player", player.Name, "position", position)
	err = api.scrobbler.NowPlaying(ctx, clientId, client, trackId, position)

	// Check if recommender is available before launching goroutine
	if api.recommender == nil {
		log.Debug(ctx, "Recommender not available, skipping queue update")
		return err
	}

	go func() {
		bgCtx := context.Background()
		bgCtx = request.WithUser(bgCtx, user)

		pqRepo := api.ds.PlayQueue(bgCtx)

		existingQueue, err := pqRepo.RetrieveWithMediaFiles(user.ID)

		if existingQueue == nil || err == model.ErrNotFound {
			existingQueue = &model.PlayQueue{
				UserID:    user.ID,
				Current:   0,
				Position:  0,
				ChangedBy: "",
				Items:     model.MediaFiles{},
			}
			existingQueue.Items = append(existingQueue.Items, *mf)
		}

		if err != nil && err != model.ErrNotFound {
			log.Error(bgCtx, "Failed to retrieve play queue", "userId", user.ID, "error", err)
			return
		}

		found := false
		for i, item := range existingQueue.Items {
			if item.ID == trackId {
				existingQueue.Current = i
				found = true
				break
			}
		}

		// If the song is not in the queue, create a new queue with just this song
		if !found {
			log.Info(bgCtx, "Current song not in queue, creating new queue", "trackId", trackId)
			existingQueue.Items = model.MediaFiles{*mf}
			existingQueue.Current = 0
		}

		if err := pqRepo.Store(existingQueue, "current"); err != nil {
			log.Error(bgCtx, "Failed to update play queue", "userId", user.ID, "error", err)
			return
		} else {
			log.Info(bgCtx, "Updated play queue current item", "userId", user.ID, "current", existingQueue.Current)
		}

		if len(existingQueue.Items) != 0 {
			if existingQueue.Current != len(existingQueue.Items)-1 {
				log.Info(bgCtx, "Play queue current item is not the last one, skipping similar songs addition", "userId", user.ID)
				return
			}
		}

		similarSongs, err := api.recommender.GetSimilarSongs(bgCtx, mf, 20)

		if err != nil {
			log.Error(bgCtx, "Failed to get similar songs", "trackId", trackId, "error", err)
			return
		}

		if len(similarSongs) == 0 {
			log.Warn(bgCtx, "No similar songs found", "trackId", trackId)
			return
		}

		existingQueue.Items = append(existingQueue.Items, similarSongs...)
		existingQueue.ChangedBy = "similar-songs-auto"

		if err := pqRepo.Store(existingQueue, "items", "current"); err != nil {
			log.Error(bgCtx, "Failed to update play queue", "userId", user.ID, "error", err)
			return
		}

		log.Info(bgCtx, "Added similar songs to queue", "userId", user.ID, "count", len(similarSongs), "trackTitle", mf.Title)

		if api.broker != nil {
			event := &events.RefreshResource{}
			api.broker.SendMessage(bgCtx, event.With("playqueue", user.ID))
		}
	}()

	return err
}
