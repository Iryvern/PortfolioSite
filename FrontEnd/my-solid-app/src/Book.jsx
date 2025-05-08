import { createSignal, onMount } from "solid-js";

function Book() {
  const [books, setBooks] = createSignal({});
  const [selectedBook, setSelectedBook] = createSignal(null);
  const [pageIndex, setPageIndex] = createSignal(0);
  const [file, setFile] = createSignal(null);
  const backend = "http://localhost:8000"; // Update with your backend URL

  onMount(fetchBooks);

  async function fetchBooks() {
    const res = await fetch(`${backend}/user/books`);
    const data = await res.json();
    setBooks(data);
  }

  function selectBook(book) {
    setSelectedBook(book);
    setPageIndex(0);
  }

  async function handleUpload() {
    if (!file()) return alert("Select a file first");
    const formData = new FormData();
    formData.append("file", file());
    formData.append("book_name", file().name.replace(".pdf", ""));
    await fetch(`${backend}/user/books/upload`, {
      method: "POST",
      body: formData,
    });
    await fetchBooks();
  }

  async function handleDelete(bookName) {
    if (confirm(`Delete ${bookName}?`)) {
      await fetch(`${backend}/user/books/${bookName}`, { method: "DELETE" });
      await fetchBooks();
      if (bookName === selectedBook()) setSelectedBook(null);
    }
  }

  const pages = () => books()[selectedBook()] || [];
  const hasPrev = () => pageIndex() > 0;
  const hasNext = () => pageIndex() < pages().length - 1;

  return (
    <div className="about-container frosted-box fade-in">
      <h2>📚 Book Manager</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} style="margin-left: 1rem;">Upload</button>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Sidebar: Book list */}
        <div style={{ minWidth: "200px", borderRight: "1px solid #ccc" }}>
          <h4>Library</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {Object.keys(books()).map((book) => (
              <li style={{ marginBottom: "0.5rem" }}>
                <span
                  onClick={() => selectBook(book)}
                  style={{
                    cursor: "pointer",
                    color: book === selectedBook() ? "#0ea5e9" : "#111827",
                    fontWeight: book === selectedBook() ? "bold" : "normal",
                  }}
                >
                  {book}
                </span>{" "}
                <button style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }} onClick={() => handleDelete(book)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Viewer */}
        <div style={{ flex: 1, textAlign: "center" }}>
          {selectedBook() ? (
            <>
              <img
                src={pages()[pageIndex()]}
                alt={`Page ${pageIndex() + 1}`}
                style={{ maxWidth: "100%", maxHeight: "700px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <div style={{ marginTop: "1rem" }}>
                <button onClick={() => setPageIndex(pageIndex() - 1)} disabled={!hasPrev()}>
                  ◀ Previous
                </button>
                <span style={{ margin: "0 1rem" }}>
                  Page {pageIndex() + 1} of {pages().length}
                </span>
                <button onClick={() => setPageIndex(pageIndex() + 1)} disabled={!hasNext()}>
                  Next ▶
                </button>
              </div>
            </>
          ) : (
            <p>Select a book to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Book;
