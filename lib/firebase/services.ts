import { collection, doc, writeBatch, onSnapshot, query, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { useInventoryStore, Category, Product, RawMaterial, Variant, Recipe } from '@/store/useInventoryStore';
import { Transaction, useTransactionStore } from '@/store/useTransactionStore';
import { Shift, PettyCashTransaction, useShiftStore } from '@/store/useShiftStore';

export async function upsertFirebaseCategory(cat: Category) {
  if (!db) return;
  await setDoc(doc(db, 'categories', cat.id), cat);
}

export async function deleteFirebaseCategory(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'categories', id));
}

export async function upsertFirebaseProduct(prod: Product) {
  if (!db) return;
  await setDoc(doc(db, 'products', prod.id), prod);
}

export async function deleteFirebaseProduct(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'products', id));
}

export async function upsertFirebaseRawMaterial(rm: RawMaterial) {
  if (!db) return;
  await setDoc(doc(db, 'rawMaterials', rm.id), rm);
}

export async function deleteFirebaseRawMaterial(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'rawMaterials', id));
}

export async function upsertFirebaseVariant(variant: Variant) {
  if (!db) return;
  await setDoc(doc(db, 'variants', variant.id), variant);
}

export async function deleteFirebaseVariant(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'variants', id));
}

export async function upsertFirebaseRecipe(recipe: Recipe) {
  if (!db) return;
  await setDoc(doc(db, 'recipes', recipe.id), recipe);
}

export async function deleteFirebaseRecipe(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'recipes', id));
}

export async function upsertFirebaseTransaction(tx: Transaction) {
  if (!db) return;
  const txData = { ...tx, timestamp: tx.timestamp.toISOString() }; // Safe serialization
  await setDoc(doc(db, 'transactions', tx.id), txData);
}

export async function upsertFirebaseShift(shift: Shift) {
  if (!db) return;
  await setDoc(doc(db, 'shifts', shift.id), shift);
}

export async function upsertFirebasePettyCash(pc: PettyCashTransaction) {
  if (!db) return;
  await setDoc(doc(db, 'pettyCash', pc.id), pc);
}

export async function seedMockDataToFirebase() {
  if (!db) {
    console.error("Firebase DB is not initialized.");
    return false;
  }
  try {
    const batch = writeBatch(db);

    const { categories, products, rawMaterials } = useInventoryStore.getState();

    // Seed Categories
    for (const cat of categories) {
      const ref = doc(db, 'categories', cat.id);
      batch.set(ref, cat);
    }

    // Seed Products
    for (const prod of products) {
      const ref = doc(db, 'products', prod.id);
      batch.set(ref, prod);
    }

    // Seed Raw Materials
    for (const rm of rawMaterials) {
      const ref = doc(db, 'rawMaterials', rm.id);
      batch.set(ref, rm);
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    return false;
  }
}

export function subscribeToInventoryData() {
  if (!db) return () => {};

  const unsubCategories = onSnapshot(query(collection(db, 'categories')), (snapshot) => {
    const cats = snapshot.docs.map(doc => doc.data() as any);
    if (cats.length > 0) {
      useInventoryStore.setState({ categories: cats });
    }
  });

  const unsubProducts = onSnapshot(query(collection(db, 'products')), (snapshot) => {
    const prods = snapshot.docs.map(doc => doc.data() as any);
    if (prods.length > 0) {
      useInventoryStore.setState({ products: prods });
    }
  });

  const unsubRawMaterials = onSnapshot(query(collection(db, 'rawMaterials')), (snapshot) => {
    const rms = snapshot.docs.map(doc => doc.data() as any);
    if (rms.length > 0) {
      useInventoryStore.setState({ rawMaterials: rms });
    }
  });

  const unsubVariants = onSnapshot(query(collection(db, 'variants')), (snapshot) => {
    const vars = snapshot.docs.map(doc => doc.data() as any);
    if (vars.length > 0) {
      useInventoryStore.setState({ variants: vars });
    }
  });

  const unsubRecipes = onSnapshot(query(collection(db, 'recipes')), (snapshot) => {
    const recs = snapshot.docs.map(doc => doc.data() as any);
    if (recs.length > 0) {
      useInventoryStore.setState({ recipes: recs });
    }
  });

  return () => {
    unsubCategories();
    unsubProducts();
    unsubRawMaterials();
    unsubVariants();
    unsubRecipes();
  };
}

export function subscribeToTransactions() {
  if (!db) return () => {};
  return onSnapshot(query(collection(db, 'transactions')), (snapshot) => {
    const txs = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, timestamp: new Date(data.timestamp) };
    }) as any[];
    if (txs.length > 0) {
      useTransactionStore.setState({ transactions: txs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()) });
    }
  });
}

export function subscribeToShifts() {
  if (!db) return () => {};
  const unsubShifts = onSnapshot(query(collection(db, 'shifts')), (snapshot) => {
    const shifts = snapshot.docs.map(doc => doc.data() as any);
    if (shifts.length > 0) {
      const openShift = shifts.find((s: any) => s.status === 'OPEN') || null;
      const history = shifts.filter((s: any) => s.status !== 'OPEN').sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      useShiftStore.setState({ currentShift: openShift, shiftHistory: history });
    }
  });

  const unsubPettyCash = onSnapshot(query(collection(db, 'pettyCash')), (snapshot) => {
    const history = snapshot.docs.map(doc => doc.data() as any).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (history.length > 0) {
      useShiftStore.setState({ pettyCashHistory: history });
    }
  });

  return () => {
    unsubShifts();
    unsubPettyCash();
  };
}
