package main

import (
	"bytes"
	"embed"
	"html/template"
	"io"
	"io/fs"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/pflag"
)

var dataDir string
var listen string

func init() {
	pflag.StringVar(&dataDir, "data", "data", "data directory")
	pflag.StringVar(&listen, "listen", ":8000", "listen address")
}

//go:embed static/index.js static/style.css
var static embed.FS

//go:embed templates
var templates embed.FS

type server struct {
	*http.ServeMux
	template *template.Template
	textIndexer
}

var _ http.Handler = &server{}

func newServer() *server {
	t, err := fs.Sub(templates, "templates")
	if err != nil {
		panic(err)
	}
	s := &server{
		template:    template.Must(template.ParseFS(t, "*.html")),
		textIndexer: textIndexer{textDir: filepath.Join(dataDir, "text")},
	}
	s.refreshTextIndex()
	return s
}

type indexContext struct {
	Text template.JSStr
}

func errorCode(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func (s *server) templateResponse(w http.ResponseWriter, name string, data interface{}) {
	var buf bytes.Buffer
	err := s.template.ExecuteTemplate(&buf, name, data)
	if err != nil {
		log.Println(err)
		errorCode(w, http.StatusInternalServerError)
		return
	}
	io.Copy(w, &buf)
}

type textIndexer struct {
	textDir string
	files   []string
}

func (t *textIndexer) refreshTextIndex() {
	files, err := os.ReadDir(t.textDir)
	if err != nil {
		panic(err)
	}
	t.files = nil
	for _, file := range files {
		t.files = append(t.files, file.Name())
	}
}

func (t *textIndexer) sample() (string, error) {
	n := rand.Intn(len(t.files))
	buf, err := ioutil.ReadFile(filepath.Join(t.textDir, t.files[n]))
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(buf)), nil
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	text, err := s.sample()
	if err != nil {
		log.Println(err)
		errorCode(w, http.StatusInternalServerError)
		return
	}
	s.templateResponse(w, "index.html", &indexContext{
		Text: template.JSStr(text),
	})
}

func main() {
	pflag.Parse()

	err := os.MkdirAll(dataDir, 0755)
	if err != nil {
		log.Fatalf("cannot create data directory %q: %v", dataDir, err)
	}

	staticDir, err := fs.Sub(static, "static")
	if err != nil {
		log.Fatal(err)
	}
	staticServer := http.FileServer(http.FS(staticDir))
	http.Handle("/index.js", staticServer)
	http.Handle("/style.css", staticServer)
	http.Handle("/", newServer())

	log.Println("server running at", listen)
	err = http.ListenAndServe(listen, nil)
	if err != nil {
		log.Fatal(err)
	}
}
