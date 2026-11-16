package search_list_hashset;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;

public class Main {
    static void main() {
        int n = 500000;

        ArrayList<Integer> arrayList = new ArrayList<>();
        HashSet<Integer> hashSet = new HashSet<>();

        for(int i = 0; i < n; i++){
            arrayList.add(i);
            hashSet.add(i);
        }

        for(int i = 0; i <= 5; i++){
            System.out.println("Run number: " + i);

            System.out.println("ArrayList first element: " + measure(arrayList, 0) + "ns");
            System.out.println("HashSet first element: " + measure(hashSet, 0) + "ns");
            System.out.println();
            System.out.println("ArrayList first element: " + measure(arrayList, n - 1) + "ns");
            System.out.println("HashSet first element: " + measure(hashSet, n - 1) + "ns");
            System.out.println();
            System.out.println("ArrayList first element: " + measure(arrayList, -1) + "ns");
            System.out.println("HashSet first element: " + measure(hashSet, -1) + "ns");

        }
    }

    public static long measure(Collection<Integer> collection, int x){
        int reps = 1000;
        long start = System.nanoTime();
        for(int i = 0; i < reps; i++){
            collection.contains(x);
        }
        return (System.nanoTime() - start) / reps;
    }
}
