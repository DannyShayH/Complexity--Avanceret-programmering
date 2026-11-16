package comparable_equal_hash;

public record Book(int id, String name) implements Comparable<Book> {

    public Book(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public int compareTo(Book other) {
        return Integer.compare(id, other.id);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof Book other)) {
            return false;
        }
        return id == other.id;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }

    @Override
    public String toString() {
        return "Book{id=" + id + ", name='" + name + "'}";
    }
}
