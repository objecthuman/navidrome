package recommender

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"

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
		client: NewClient("http://192.168.1.32:8001"),
	}
}

func (r *recommender) GetSimilarSongs(ctx context.Context, mf *model.MediaFile, topK int) (model.MediaFiles, error) {
	// Convert Linux path to Windows path
	// mf.Path is like: "complete/hunterbiden5000/Whatever, Dad - 100% Take Home!"
	// We need: "C:\programming\music-recommendation\music\complete\hunterbiden5000\Whatever, Dad - 100% Take Home!"

	windowsBasePath := `C:\programming\music-recommendation\music`
	windowsPath := filepath.Join(windowsBasePath, mf.Path)
	// Convert forward slashes to backslashes for Windows
	windowsPath = strings.ReplaceAll(windowsPath, "/", "\\")

	fmt.Println("Getting similar songs for:", windowsPath)

	similarPaths, err := r.client.FindSimilar(ctx, windowsPath, topK)
	if err != nil {
		return nil, err
	}

	if len(similarPaths) == 0 {
		return model.MediaFiles{}, nil
	}

	// Convert Windows paths back to Linux paths for database lookup
	linuxPaths := make([]string, len(similarPaths))
	for i, winPath := range similarPaths {
		// Remove the Windows base path prefix
		linuxPath := strings.TrimPrefix(winPath, windowsBasePath)
		linuxPath = strings.TrimPrefix(linuxPath, "\\")
		// Convert backslashes to forward slashes
		linuxPath = strings.ReplaceAll(linuxPath, "\\", "/")
		linuxPaths[i] = linuxPath
		fmt.Println("Converted path:", winPath, "->", linuxPath)
	}

	mfRepo := r.ds.MediaFile(ctx)
	songs, err := mfRepo.FindByPaths(linuxPaths)
	if err != nil {
		return nil, err
	}

	return songs, nil
}
