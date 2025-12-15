package recommender

import (
	"context"

	"github.com/navidrome/navidrome/conf"
	"github.com/navidrome/navidrome/log"
	"github.com/navidrome/navidrome/model"
)

type Recommender interface {
	GetSimilarSongs(ctx context.Context, mf *model.MediaFile, topK int) (model.MediaFiles, error)
}

type recommender struct {
	ds     model.DataStore
	client *Client
}

func New(ds model.DataStore) Recommender {
	return &recommender{
		ds:     ds,
		client: NewClient(conf.Server.RecommendationServerBaseURL),
	}
}

func (r *recommender) GetSimilarSongs(ctx context.Context, mf *model.MediaFile, topK int) (model.MediaFiles, error) {
	log.Info(ctx, "Getting similar songs for:", "path", mf.Path)

	similarPaths, err := r.client.FindSimilar(ctx, mf.Path, topK)
	if err != nil {
		return nil, err
	}

	if len(similarPaths) == 0 {
		return model.MediaFiles{}, nil
	}

	mfRepo := r.ds.MediaFile(ctx)
	songs, err := mfRepo.FindByPaths(similarPaths)
	if err != nil {
		return nil, err
	}

	return songs, nil
}
