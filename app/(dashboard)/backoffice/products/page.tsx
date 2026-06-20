"use client";

import React, { useState, useEffect } from "react";
import {
  useInventoryStore,
  Product,
  Category,
} from "@/store/useInventoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search, Coffee, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormSelect } from "@/components/ui/form-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN" && user.role !== "MANAGER") {
      router.replace("/pos");
      toast.error("Akses ditolak: Anda tidak memiliki izin ke halaman ini");
    }
  }, [user, router]);

  const {
    products,
    categories,
    rawMaterials,
    variants,
    deleteProduct,
    deleteCategory,
    addCategory,
    addProduct,
    updateProduct,
    updateCategory,
    addVariant,
    updateVariant,
    deleteVariant,
  } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<
    "PRODUCTS" | "CATEGORIES" | "VARIANTS"
  >("PRODUCTS");
  const [search, setSearch] = useState("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#00E5FF");
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<
    string | null
  >(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<
    string | null
  >(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    categoryId: "",
    basePrice: 0,
    type: "SINGLE",
    recipe: "",
  });
  const [moneyText, setMoneyText] = useState("");
  const [comboSearch, setComboSearch] = useState("");

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState<any>({
    name: "",
    isRequired: false,
    type: "SINGLE_CHOICE",
    options: [],
  });
  const [deleteVariantConfirm, setDeleteVariantConfirm] = useState<
    string | null
  >(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredVariants =
    variants?.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      categoryId: categories[0]?.id || "",
      basePrice: 0,
      type: "SINGLE",
      variantIds: [],
      comboItems: [],
    });
    setMoneyText("");
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      categoryId: p.categoryId,
      basePrice: p.basePrice,
      type: p.type,
      variantIds: p.variantIds || [],
      comboItems: p.comboItems || [],
    });
    setMoneyText(p.basePrice?.toString() || "0");
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.categoryId || !moneyText) {
      return toast.error("Harap lengkapi data wajib (Nama, Kategori, Harga)!");
    }

    const finalPrice = parseInt(moneyText) || 0;
    const loadToast = toast.loading("Menyimpan menu...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (editingProductId) {
        updateProduct(editingProductId, {
          ...productForm,
          basePrice: finalPrice,
        });
        toast.success("Menu diubah!", { id: loadToast });
      } else {
        addProduct({
          id:
            "p" +
            Date.now().toString(36).substring(3, 7) +
            Math.floor(Math.random() * 1000).toString(),
          name: productForm.name,
          categoryId: productForm.categoryId,
          basePrice: finalPrice,
          type: productForm.type as "SINGLE" | "COMBO",
          variantIds: productForm.variantIds || [],
          comboItems: productForm.comboItems || [],
        });
        toast.success("Menu ditambahkan!", { id: loadToast });
      }
      setIsProductModalOpen(false);
    } catch (e) {
      toast.error("Gagal menyimpan menu!", { id: loadToast });
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setNewCatName("");
    setNewCatColor("#00E5FF");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: Category) => {
    setEditingCategoryId(c.id);
    setNewCatName(c.name);
    setNewCatColor(c.color);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCatName) return toast.error("Nama kategori wajib diisi!");
    const loadToast = toast.loading("Menyimpan kategori...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (editingCategoryId) {
        updateCategory(editingCategoryId, {
          name: newCatName,
          color: newCatColor,
        });
        toast.success("Kategori diubah!", { id: loadToast });
      } else {
        addCategory({
          id: "c" + Date.now().toString(36),
          name: newCatName,
          color: newCatColor,
        });
        toast.success("Kategori ditambahkan!", { id: loadToast });
      }
      setIsCategoryModalOpen(false);
    } catch (e) {
      toast.error("Gagal menyimpan kategori!", { id: loadToast });
    }
  };

  const handleOpenAddVariant = () => {
    setEditingVariantId(null);
    setVariantForm({
      name: "",
      isRequired: false,
      type: "SINGLE_CHOICE",
      options: [],
    });
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariant = (v: any) => {
    setEditingVariantId(v.id);
    setVariantForm(JSON.parse(JSON.stringify(v))); // deep copy
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!variantForm.name) return toast.error("Nama varian wajib!");
    if (!variantForm.options || variantForm.options.length === 0)
      return toast.error("Minimal 1 opsi varian wajib!");

    // Ensure ops have valid names and prices
    const cleanOptions = variantForm.options.map((o: any) => ({
      name: o.name || "Unnamed",
      priceAdjustment: o.priceAdjustment || 0,
    }));

    const loadToast = toast.loading("Menyimpan varian...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (editingVariantId) {
        updateVariant(editingVariantId, {
          ...variantForm,
          options: cleanOptions,
        });
        toast.success("Varian berhasil diubah!", { id: loadToast });
      } else {
        addVariant({
          id: "var_" + Date.now().toString(36),
          name: variantForm.name,
          isRequired: variantForm.isRequired,
          type: variantForm.type,
          options: cleanOptions,
        });
        toast.success("Varian berhasil ditambahkan!", { id: loadToast });
      }
      setIsVariantModalOpen(false);
    } catch (e) {
      toast.error("Gagal menyimpan varian!", { id: loadToast });
    }
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(val);

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">
            Master Produk
          </h1>
          <p className="font-inter font-bold text-gray-500">
            Kelola menu dan kategori yang tampil di kasir.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 bg-white border-4 border-black p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("PRODUCTS")}
            className={`px-4 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === "PRODUCTS" ? "bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]" : "text-gray-500 hover:text-black border-2 border-transparent"}`}
          >
            Menu Produk
          </button>
          <button
            onClick={() => setActiveTab("CATEGORIES")}
            className={`px-4 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === "CATEGORIES" ? "bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]" : "text-gray-500 hover:text-black border-2 border-transparent"}`}
          >
            Kategori
          </button>
          <button
            onClick={() => setActiveTab("VARIANTS")}
            className={`px-4 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === "VARIANTS" ? "bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]" : "text-gray-500 hover:text-black border-2 border-transparent"}`}
          >
            Varian Menu
          </button>
        </div>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={
                activeTab === "PRODUCTS" ? "Cari menu..." : "Cari kategori..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === "PRODUCTS" && (
            <div className="flex gap-2">
              <Button onClick={handleOpenAddProduct} className="gap-2">
                <Plus className="w-5 h-5" /> TAMBAH MENU
              </Button>
            </div>
          )}
          {activeTab === "CATEGORIES" && (
            <Button
              onClick={handleOpenAddCategory}
              className="gap-2 bg-[#00E5FF] text-black hover:bg-cyan-300 border-2 border-black shadow-[2px_2px_0_0_#000]"
            >
              <Plus className="w-5 h-5" /> KATEGORI BARU
            </Button>
          )}
          {activeTab === "VARIANTS" && (
            <Button
              onClick={handleOpenAddVariant}
              className="gap-2 bg-[#FF90E8] text-black hover:bg-pink-300 border-2 border-black shadow-[2px_2px_0_0_#000]"
            >
              <Plus className="w-5 h-5" /> VARIAN BARU
            </Button>
          )}
        </div>

        <div className="overflow-x-auto border-4 border-black rounded-xl">
          <Table>
            <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase">
              {activeTab === "PRODUCTS" && (
                <TableRow>
                  <TableHead className="w-[100px] text-black border-r-2 border-black">
                    Tipe
                  </TableHead>
                  <TableHead className="text-black border-r-2 border-black">
                    Nama Menu
                  </TableHead>
                  <TableHead className="text-black border-r-2 border-black">
                    Kategori
                  </TableHead>
                  <TableHead className="text-black border-r-2 border-black text-right">
                    Harga Dasar
                  </TableHead>
                  <TableHead className="text-right text-black w-[150px]">
                    Aksi
                  </TableHead>
                </TableRow>
              )}
              {activeTab === "CATEGORIES" && (
                <TableRow>
                  <TableHead className="text-black border-r-2 border-black w-[200px]">
                    Warna
                  </TableHead>
                  <TableHead className="text-black border-r-2 border-black">
                    Nama Kategori
                  </TableHead>
                  <TableHead className="text-right text-black w-[150px]">
                    Aksi
                  </TableHead>
                </TableRow>
              )}
              {activeTab === "VARIANTS" && (
                <TableRow>
                  <TableHead className="text-black border-r-2 border-black">
                    Nama Varian
                  </TableHead>
                  <TableHead className="text-black border-r-2 border-black">
                    Tipe & Sifat
                  </TableHead>
                  <TableHead className="text-black border-r-2 border-black">
                    Jumlah Opsi
                  </TableHead>
                  <TableHead className="text-right text-black w-[150px]">
                    Aksi
                  </TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody className="font-inter font-bold">
              {activeTab === "PRODUCTS" &&
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <TableRow
                      key={p.id}
                      className="border-b-2 border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="border-r-2 border-gray-200">
                        <span
                          className={`px-2 py-1 text-xs border-2 border-black rounded-md ${p.type === "COMBO" ? "bg-[#FF90E8]" : "bg-gray-200"}`}
                        >
                          {p.type}
                        </span>
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-md flex items-center justify-center">
                            <Coffee className="w-4 h-4 text-gray-500" />
                          </div>
                          {p.name}
                        </div>
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-200">
                        {cat && (
                          <span
                            className="px-2 py-1 text-xs border-2 border-black rounded-md uppercase"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right border-r-2 border-gray-200 text-[#FF6321]">
                        {formatRupiah(p.basePrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteProductConfirm(p.id)}
                            className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {activeTab === "CATEGORIES" &&
                filteredCategories.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-b-2 border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="border-r-2 border-gray-200">
                      <div
                        className="w-6 h-6 border-2 border-black rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                    </TableCell>
                    <TableCell className="border-r-2 border-gray-200 uppercase">
                      {c.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditCategory(c)}
                          className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCategoryConfirm(c.id)}
                          className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {activeTab === "VARIANTS" &&
                filteredVariants.map((v) => (
                  <TableRow
                    key={v.id}
                    className="border-b-2 border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="border-r-2 border-gray-200 uppercase font-black">
                      {v.name}
                    </TableCell>
                    <TableCell className="border-r-2 border-gray-200 text-sm">
                      <span
                        className={`px-2 py-1 mr-2 border-2 border-black rounded-md ${v.type === "SINGLE_CHOICE" ? "bg-cyan-100" : "bg-purple-100"}`}
                      >
                        {v.type === "SINGLE_CHOICE"
                          ? "Pilih Satu"
                          : "Pilih Banyak"}
                      </span>
                      <span
                        className={`px-2 py-1 border-2 border-black rounded-md ${v.isRequired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                      >
                        {v.isRequired ? "Wajib" : "Opsional"}
                      </span>
                    </TableCell>
                    <TableCell className="border-r-2 border-gray-200">
                      {v.options?.length || 0} Opsi
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditVariant(v)}
                          className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteVariantConfirm(v.id)}
                          className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {((activeTab === "PRODUCTS" && filteredProducts.length === 0) ||
                (activeTab === "CATEGORIES" &&
                  filteredCategories.length === 0) ||
                (activeTab === "VARIANTS" &&
                  filteredVariants.length === 0)) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
              {editingProductId ? "Edit Menu" : "Tambah Menu Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Menu *</Label>
              <Input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                placeholder="Contoh: Kopi Susu Aren"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label>Kategori *</Label>
                <FormSelect
                  value={productForm.categoryId || ""}
                  onValueChange={(val) =>
                    setProductForm({ ...productForm, categoryId: val })
                  }
                  className="h-10 border-2 border-black"
                  placeholder="Pilih Kategori"
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label>Tipe / Jenis</Label>
                <FormSelect
                  value={productForm.type || "SINGLE"}
                  onValueChange={(val) =>
                    setProductForm({
                      ...productForm,
                      type: (val as "SINGLE" | "COMBO") || "SINGLE",
                    })
                  }
                  className="h-10 border-2 border-black"
                  placeholder="Pilih Tipe"
                  options={[
                    { value: "SINGLE", label: "Single (Menu Satuan)" },
                    { value: "COMBO", label: "Combo (Paket)" },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Harga Dasar (Rp) *</Label>
              <Input
                type="text"
                value={
                  moneyText
                    ? new Intl.NumberFormat("id-ID").format(parseInt(moneyText))
                    : ""
                }
                onChange={(e) =>
                  setMoneyText(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Contoh: 15.000"
              />
            </div>

            <div className="flex flex-col gap-2 border-4 border-black p-4 rounded-xl mt-2 bg-gray-50">
              <Label className="text-lg font-space-grotesk font-black uppercase">
                Pilihan Varian
              </Label>
              <p className="text-xs font-inter font-bold text-gray-500 mb-2">
                Pilih varian yang berlaku untuk menu ini.
              </p>
              <div className="flex flex-wrap gap-2">
                {variants && variants.length > 0 ? (
                  variants.map((v) => {
                    const isSelected = productForm.variantIds?.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          const curr = productForm.variantIds || [];
                          if (isSelected) {
                            setProductForm({
                              ...productForm,
                              variantIds: curr.filter((id) => id !== v.id),
                            });
                          } else {
                            setProductForm({
                              ...productForm,
                              variantIds: [...curr, v.id],
                            });
                          }
                        }}
                        className={`px-3 py-1 border-2 border-black rounded-lg text-sm font-bold uppercase transition-transform active:scale-95 ${isSelected ? "bg-[#00E5FF] shadow-[2px_2px_0_0_#000]" : "bg-white text-gray-500"}`}
                      >
                        {v.name}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-sm font-bold text-gray-400 italic mb-2">
                    Belum ada data varian. Tambahkan di tab Varian Menu.
                  </div>
                )}
              </div>
            </div>

            {productForm.type === "COMBO" && (
              <div className="flex flex-col gap-2 border-4 border-black p-4 rounded-xl mt-2 bg-[#FF90E8]/20">
                <Label className="text-lg font-space-grotesk font-black uppercase">
                  Isi Menu Combo
                </Label>
                <p className="text-xs font-inter font-bold text-gray-500 mb-2">
                  Pilih menu single yang menjadi bagian dari paket ini.
                </p>

                <div className="grid grid-cols-2 gap-2 md:gap-4 h-64 md:h-80">
                  {/* Left Column: Available Single Products */}
                  <div className="flex flex-col border-2 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000]">
                    <div className="bg-gray-100 border-b-2 border-black p-2 font-space-grotesk font-black text-center text-xs md:text-sm uppercase">
                      Menu Tersedia
                    </div>
                    <div className="p-2 border-b-2 border-black">
                      <Input
                        value={comboSearch}
                        onChange={(e) => setComboSearch(e.target.value)}
                        placeholder="Cari Menu..."
                        className="h-8 border-2 border-black rounded-md text-xs font-bold"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                      {products
                        .filter(
                          (p) =>
                            p.type === "SINGLE" &&
                            p.name
                              .toLowerCase()
                              .includes(comboSearch.toLowerCase()),
                        )
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between items-center border-2 border-black p-2 rounded-lg hover:bg-gray-50 gap-2"
                          >
                            <div
                              className="text-xs md:text-sm font-bold truncate"
                              title={p.name}
                            >
                              {p.name}
                            </div>
                            <button
                              onClick={() => {
                                setProductForm({
                                  ...productForm,
                                  comboItems: [
                                    ...(productForm.comboItems || []),
                                    p.id,
                                  ],
                                });
                              }}
                              className="p-1 shrink-0 bg-[#FFD100] border-2 border-black rounded-md hover:bg-yellow-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Right Column: Selected Items */}
                  <div className="flex flex-col border-2 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000]">
                    <div className="bg-gray-100 border-b-2 border-black p-2 font-space-grotesk font-black text-center text-xs md:text-sm uppercase">
                      Isi Paket ({productForm.comboItems?.length || 0})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                      {(productForm.comboItems || []).map((itemId, idx) => {
                        const p = products.find((prod) => prod.id === itemId);
                        return (
                          <div
                            key={idx}
                            className="flex justify-between items-center border-2 border-black p-2 rounded-lg bg-[#FF90E8]/10 gap-2"
                          >
                            <div
                              className="text-xs md:text-sm font-bold truncate"
                              title={p?.name || "Unknown"}
                            >
                              {p?.name || "Unknown"}
                            </div>
                            <button
                              onClick={() => {
                                const newCombo = [
                                  ...(productForm.comboItems || []),
                                ];
                                newCombo.splice(idx, 1);
                                setProductForm({
                                  ...productForm,
                                  comboItems: newCombo,
                                });
                              }}
                              className="p-1 shrink-0 bg-red-100 text-red-600 border-2 border-black rounded-md hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      {(!productForm.comboItems ||
                        productForm.comboItems.length === 0) && (
                        <div className="flex items-center justify-center h-full text-[10px] md:text-xs text-gray-400 font-bold italic text-center p-2">
                          Pilih menu dari kiri untuk mengisi paket
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductModalOpen(false)}
            >
              BATAL
            </Button>
            <Button onClick={handleSaveProduct}>SIMPAN MENU</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
              {editingCategoryId ? "Edit Kategori" : "Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Kategori</Label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Contoh: Snack"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Warna Kategori (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-16 h-12 p-1"
                />
                <Input
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="flex-1 uppercase font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              BATAL
            </Button>
            <Button onClick={handleSaveCategory}>SIMPAN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVariantModalOpen} onOpenChange={setIsVariantModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-space-grotesk font-black text-2xl uppercase">
              {editingVariantId ? "Edit Varian" : "Tambah Varian Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Varian *</Label>
              <Input
                value={variantForm.name}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, name: e.target.value })
                }
                placeholder="Contoh: Ukuran / Topping / Rasa"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label>Sifat Pilihan</Label>
                <Select
                  value={variantForm.type}
                  onValueChange={(val) =>
                    setVariantForm({
                      ...variantForm,
                      type:
                        (val as "SINGLE_CHOICE" | "MULTIPLE_CHOICE") ||
                        "SINGLE_CHOICE",
                    })
                  }
                >
                  <SelectTrigger className="flex h-10 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0">
                    <SelectValue placeholder="Sifat Pilihan" />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                    <SelectItem
                      value="SINGLE_CHOICE"
                      label="Pilih Satu Saja (Radio)"
                    >
                      Pilih Satu Saja (Radio)
                    </SelectItem>
                    <SelectItem
                      value="MULTIPLE_CHOICE"
                      label="Pilih Banyak (Checkbox)"
                    >
                      Pilih Banyak (Checkbox)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label>Kondisi Wajib</Label>
                <Select
                  value={variantForm.isRequired ? "true" : "false"}
                  onValueChange={(val) =>
                    setVariantForm({
                      ...variantForm,
                      isRequired: val === "true",
                    })
                  }
                >
                  <SelectTrigger className="flex h-10 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0">
                    <SelectValue placeholder="Kondisi Wajib" />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                    <SelectItem value="false" label="Tidak Wajib (Opsional)">
                      Tidak Wajib (Opsional)
                    </SelectItem>
                    <SelectItem value="true" label="Wajib Diisi (Mandatory)">
                      Wajib Diisi (Mandatory)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-4 border-black p-4 rounded-xl mt-2 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <Label className="text-lg font-space-grotesk font-black uppercase">
                    Opsi Pilihan
                  </Label>
                  <p className="text-xs font-inter font-bold text-gray-500">
                    Harga opsional. Biarkan 0 jika gratis.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setVariantForm({
                      ...variantForm,
                      options: [
                        ...(variantForm.options || []),
                        { name: "", priceAdjustment: 0 },
                      ],
                    })
                  }
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-1" /> Opsi
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {variantForm.options?.map((opt: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center bg-white p-2 border-2 border-black rounded-lg"
                  >
                    <Input
                      placeholder="Nama Opsi"
                      value={opt.name}
                      onChange={(e) => {
                        const newOps = [...variantForm.options];
                        newOps[idx].name = e.target.value;
                        setVariantForm({ ...variantForm, options: newOps });
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="+ Harga (Rp)"
                      value={opt.priceAdjustment || ""}
                      onChange={(e) => {
                        const newOps = [...variantForm.options];
                        newOps[idx].priceAdjustment =
                          parseInt(e.target.value) || 0;
                        setVariantForm({ ...variantForm, options: newOps });
                      }}
                      className="w-32 text-right"
                    />
                    <button
                      onClick={() => {
                        const newOps = [...variantForm.options];
                        newOps.splice(idx, 1);
                        setVariantForm({ ...variantForm, options: newOps });
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {(!variantForm.options || variantForm.options.length === 0) && (
                  <div className="text-sm text-center text-gray-500 font-bold py-4">
                    Belum ada opsi. Silahkan tambah opsi.
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVariantModalOpen(false)}
            >
              BATAL
            </Button>
            <Button onClick={handleSaveVariant}>SIMPAN VARIAN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCategoryConfirm}
        onOpenChange={(open) => !open && setDeleteCategoryConfirm(null)}
        title="Hapus Kategori?"
        description="Semua menu di kategori ini dapat kehilangan referensi kategori."
        onConfirm={async () => {
          if (deleteCategoryConfirm) {
            const loadToast = toast.loading("Menghapus kategori...");
            await new Promise((resolve) => setTimeout(resolve, 600));
            deleteCategory(deleteCategoryConfirm);
            toast.success("Kategori berhasil dihapus", { id: loadToast });
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteProductConfirm}
        onOpenChange={(open) => !open && setDeleteProductConfirm(null)}
        title="Hapus Menu?"
        description="Menu yang dihapus tidak akan tampil lagi di kasir."
        onConfirm={async () => {
          if (deleteProductConfirm) {
            const loadToast = toast.loading("Menghapus menu...");
            await new Promise((resolve) => setTimeout(resolve, 600));
            deleteProduct(deleteProductConfirm);
            toast.success("Menu berhasil dihapus", { id: loadToast });
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteVariantConfirm}
        onOpenChange={(open) => !open && setDeleteVariantConfirm(null)}
        title="Hapus Varian?"
        description="Semua menu yang menggunakan varian ini akan kehilangan pilihan varian ini secara otomatis."
        onConfirm={async () => {
          if (deleteVariantConfirm) {
            const loadToast = toast.loading("Menghapus varian...");
            await new Promise((resolve) => setTimeout(resolve, 600));
            deleteVariant(deleteVariantConfirm);
            toast.success("Varian berhasil dihapus", { id: loadToast });
          }
        }}
      />
    </div>
  );
}
