package recommender

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type similarRequest struct {
	FilePath string `json:"file_path"`
	TopK     int    `json:"top_k"`
}

type similarResponse struct {
	QueryFile string          `json:"query_file"`
	Results   []similarResult `json:"results"`
	Count     int             `json:"count"`
}

type similarResult struct {
	ID       string         `json:"id"`
	Metadata resultMetadata `json:"metadata"`
	Distance float64        `json:"distance"`
}

type resultMetadata struct {
	Artist    string `json:"artist"`
	SongName  string `json:"song_name"`
	AlbumName string `json:"album_name"`
	Genre     string `json:"genre"`
	FilePath  string `json:"file_path"`
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) FindSimilar(ctx context.Context, filePath string, topK int) ([]string, error) {
	url := fmt.Sprintf("%s/v1/music/similar", c.baseURL)
	fmt.Println(url)

	reqBody := similarRequest{
		FilePath: filePath,
		TopK:     topK,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var result similarResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Extract file paths from results
	filePaths := make([]string, len(result.Results))
	for i, r := range result.Results {
		filePaths[i] = r.Metadata.FilePath
	}

	return filePaths, nil
}
