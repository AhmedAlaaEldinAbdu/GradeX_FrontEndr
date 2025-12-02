const Book = '/Book';

export const BookEndpoints = {
  getBooks: Book,
  getBookById: (id: string) => `${Book}/${id}`,
  addBook: Book,
  editBook: (id: string) => `${Book}?Id=${id}`,
  deleteBook: (id: string) => `${Book}/${id}`,
};
