const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeAll(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS books (
      isbn TEXT PRIMARY KEY,
      amazon_url TEXT,
      author TEXT,
      language TEXT,
      pages INTEGER,
      publisher TEXT,
      title TEXT,
      year INTEGER
    );
  `);
});

beforeEach(async () => {
  await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('123456789', 'http://amazon.com/book1', 'Author1', 'English', 100, 'Publisher1', 'Book1', 2020);
  `);
});

afterEach(async () => {
  await db.query("DELETE FROM books");
});

afterAll(async () => {
  await db.end();
});

describe("POST /books", () => {
  test("Creates a new book with valid data", async () => {
    const res = await request(app).post("/books").send({
      isbn: "987654321",
      amazon_url: "http://amazon.com/book2",
      author: "Author2",
      language: "English",
      pages: 200,
      publisher: "Publisher2",
      title: "Book2",
      year: 2021
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn", "987654321");
  });

  test("Rejects invalid data", async () => {
    const res = await request(app).post("/books").send({
      isbn: "123",
      title: "Invalid Book"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("instance requires property");
  });
});

describe("PATCH /books/:isbn", () => {
  test("Updates an existing book with valid data", async () => {
    const res = await request(app).patch("/books/123456789").send({
      title: "Updated Title",
      pages: 150
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.book.title).toBe("Updated Title");
    expect(res.body.book.pages).toBe(150);
  });

  test("Rejects invalid data", async () => {
    const res = await request(app).patch("/books/123456789").send({
      pages: "Not a Number"
    });

    expect(res.statusCode).toBe(400);
  });
});
