package comparable_equal_hash;

import java.util.HashSet;
import java.util.TreeSet;

public class Main {
    static void main() {
        Book book1 = new Book(42, "First Book");
        Book book2 = new Book(7, "Second Book");
        Book book3 = new Book(100, "Third Book");

        TreeSet<Book> treeSet = new TreeSet<>();
        HashSet<Book> hashSet = new HashSet<>();

        treeSet.add(book1);
        treeSet.add(book2);
        treeSet.add(book3);

        hashSet.add(book1);
        hashSet.add(book2);
        hashSet.add(book3);

        System.out.println("TreeSet: " + treeSet);
        System.out.println("HashSet: " + hashSet);

        Book bookToFind = new Book(7, "Another name");
        System.out.println("TreeSet contains id 7: " + treeSet.contains(bookToFind));
        System.out.println("HashSet contains id 7: " + hashSet.contains(bookToFind));

        treeSet.remove(bookToFind);
        hashSet.remove(bookToFind);
        System.out.println("TreeSet after remove: " + treeSet);
        System.out.println("HashSet after remove: " + hashSet);

        System.out.println();
        System.out.println("TreeSet add, contains and remove: O(log n)");
        System.out.println("HashSet add, contains and remove: O(1) on average");

        int numberOfBooks = 100000;
        Book[] books = new Book[numberOfBooks];

        for (int i = 0; i < numberOfBooks; i++) {
            books[i] = new Book(i, "Book " + i);
        }

        TreeSet<Book> largeTreeSet = new TreeSet<>();
        HashSet<Book> largeHashSet = new HashSet<>();

        long start = System.nanoTime();
        for (Book book : books) {
            largeTreeSet.add(book);
        }
        long treeAddTime = System.nanoTime() - start;

        start = System.nanoTime();
        for (Book book : books) {
            largeHashSet.add(book);
        }
        long hashAddTime = System.nanoTime() - start;

        start = System.nanoTime();
        for (Book book : books) {
            largeTreeSet.contains(book);
        }
        long treeContainsTime = System.nanoTime() - start;

        start = System.nanoTime();
        for (Book book : books) {
            largeHashSet.contains(book);
        }
        long hashContainsTime = System.nanoTime() - start;

        start = System.nanoTime();
        for (Book book : books) {
            largeTreeSet.remove(book);
        }
        long treeRemoveTime = System.nanoTime() - start;

        start = System.nanoTime();
        for (Book book : books) {
            largeHashSet.remove(book);
        }
        long hashRemoveTime = System.nanoTime() - start;

        System.out.println();
        System.out.println("Times for " + numberOfBooks + " books in nanoseconds:");
        System.out.println("TreeSet add: " + treeAddTime + "ns");
        System.out.println("HashSet add: " + hashAddTime + "ns");
        System.out.println();
        System.out.println("TreeSet contains: " + treeContainsTime + "ns");
        System.out.println("HashSet contains: " + hashContainsTime + "ns");
        System.out.println();
        System.out.println("TreeSet remove: " + treeRemoveTime + "ns");
        System.out.println("HashSet remove: " + hashRemoveTime + "ns");
    }
}
