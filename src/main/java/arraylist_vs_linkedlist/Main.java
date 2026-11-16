package arraylist_vs_linkedlist;

import java.util.ArrayList;
import java.util.LinkedList;

public class Main {
    static void main() {
        int n = 500000;

        ArrayList<Integer> arrayList = new ArrayList<>();
        LinkedList<Integer> linkedList = new LinkedList<>();

        for(int i = 0; i < n; i++){
            arrayList.add(i);
            linkedList.add(i);
        }

        for(int i = 0; i <= 5; i++){
            System.out.println("Run number: " + i);

            long start = System.nanoTime();
            arrayList.get(250000);
            long arrayTime = System.nanoTime() - start;

            start = System.nanoTime();
            linkedList.get(250000);
            long linkedTime = System.nanoTime() - start;

            System.out.println("ArrayList: " + arrayTime + " ns");
            System.out.println("LinkedList: " + linkedTime + " ns");
        }
    }
}
