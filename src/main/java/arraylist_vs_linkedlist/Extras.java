package arraylist_vs_linkedlist;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Extras {
    static void main() {
        int n = 500000;
        int reps = 1000;

        ArrayList<Integer> arrayList = new ArrayList<>();
        LinkedList<Integer> linkedList = new LinkedList<>();

        for(int i = 0; i < n; i++){
            arrayList.add(i);
            linkedList.add(i);
        }

        for(int i = 0; i <= 5; i++){
            System.out.println("Run number: " + i);

            System.out.println("ArrayList get halfway point: " + measureGet(arrayList, reps) + "ns");
            System.out.println("LinkedList get halfway point: " + measureGet(linkedList, reps) + "ns");
            System.out.println();
            System.out.println("ArrayList add 99 at index 250000: " + measureAdd(arrayList, reps) + "ns");
            System.out.println("LinkedList add 99 at index 250000: " + measureAdd(linkedList, reps) + "ns");
            System.out.println();
            System.out.println("ArrayList remove 250000: " + measureRemove(arrayList, reps) + "ns");
            System.out.println("LinkedList remove 250000: " + measureRemove(linkedList, reps) + "ns");
            System.out.println();
            System.out.println("ArrayList add 99 at index 0: " + measureAddIndexZero(arrayList) + "ns");
            System.out.println("LinkedList add 99 at index 0: " + measureAddIndexZero(linkedList) + "ns");

        }
    }

    public static long measureGet(List<Integer> list, int reps){
        long start = System.nanoTime();
        for(int i = 0; i < reps; i++){
            list.get(250000);
        }
        return (System.nanoTime() - start) / reps;
    }

    public static long measureAdd(List<Integer> list, int reps){
        long total = 0;
        for(int i = 0; i < reps; i++){
            long start = System.nanoTime();
            list.add(250000, 99);
            total += System.nanoTime() - start;

            list.remove(250000);
        }
        return total / reps;
    }

    public static long measureRemove(List<Integer> list, int reps){
        long total = 0;
        for(int i = 0; i < reps; i++){
        long start = System.nanoTime();
        list.remove(250000);
        total += System.nanoTime() - start;

        list.add(250000, 99);
        }
        return total / reps;
    }

    public static long measureAddIndexZero(List<Integer> list){
        long start = System.nanoTime();
        for(int i = 0; i < 10000; i++){
            list.add(0,99);
        }
        long total = System.nanoTime() - start;

        for(int i = 0; i < 10000; i++){
            list.remove(0);
        }
        return total;
    }
}
