package ui

import (
	"embed"
	"io/fs"
)

//go:embed dist/*
var filesystem embed.FS

func BuildAssets() fs.FS {
	build, _ := fs.Sub(filesystem, "build")
	return build
}
