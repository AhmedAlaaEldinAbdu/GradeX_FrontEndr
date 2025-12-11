const Book = '/Book';

export const BookEndpoints = {
  getBooks: Book,
  getBookById: (id: string) => `${Book}/${id}`,
  getBookDetails: (bookId: string) => `${Book}/${bookId}/Book`,
  getBookGradeDetails: (gradeBookId: string) => `${Book}/${gradeBookId}/BookGrade`,
  addBook: Book,
  editBook: (id: string) => `${Book}?Id=${id}`,
  deleteBook: (id: string) => `${Book}/${id}`,
};
