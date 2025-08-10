// app/admin/products/page.tsx

"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storeManager } from "@/lib/store";
import { 
  Search, Plus, Edit, AlertTriangle, Package, X, Trash2, Loader2, RefreshCw 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Product, Category } from "@/types";

// Helper function to format currency
function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return "৳" + value.toFixed(2);
}

// Stats card component with animation
const StatsCard = ({ 
  title, 
  value, 
  description,
  variant = "default"
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  variant?: "default" | "warning" | "danger" | "success";
}) => {
  const variantColors = {
    default: "text-foreground",
    warning: "text-yellow-600",
    danger: "text-red-600",
    success: "text-green-600",
  };

  return (
    <Card className="p-4 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-md">
      <div className={`text-2xl font-bold ${variantColors[variant]} animate-fadeIn`}>{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </Card>
  );
};

// Product card component with animations
const ProductCard = ({
  product,
  categories,
  onEdit,
  onDelete,
  onStockUpdate,
  updatingStockId,
  deletingProductId,
  isLoading
}: {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onStockUpdate: (id: string, newStock: number) => void;
  updatingStockId: string | null;
  deletingProductId: string | null;
  isLoading: boolean;
}) => {
  const categoryName = categories.find(c => c.id === product.categoryId)?.name || "N/A";
  const stockStatus = product.stock === 0 
    ? "Out of Stock" 
    : product.stock < 10 
      ? "Low Stock" 
      : "In Stock";
  
  const stockVariant = product.stock === 0 
    ? "destructive" 
    : product.stock < 10 
      ? "warning" 
      : "success";

  return (
    <Card 
      key={product.id} 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fadeIn"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          {isLoading ? (
            <Skeleton className="h-6 w-3/4" />
          ) : (
            <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
          )}
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost"
              className="h-7 w-7 transition-colors duration-200 hover:bg-blue-100"
              onClick={() => onEdit(product)}
              disabled={isLoading || updatingStockId === product.id || deletingProductId === product.id}
              aria-label="Edit product"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
              onClick={() => onDelete(product.id)}
              disabled={isLoading || updatingStockId === product.id || deletingProductId === product.id}
              aria-label="Delete product"
            >
              {deletingProductId === product.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-full mt-2" />
        ) : (
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">ID</div>
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div className="font-mono truncate text-xs">{product.id}</div>
            )}
          </div>
          
          {product.sku && (
            <div>
              <div className="text-muted-foreground">SKU</div>
              {isLoading ? (
                <Skeleton className="h-4 w-3/4" />
              ) : (
                <div className="truncate">{product.sku}</div>
              )}
            </div>
          )}
          
          <div>
            <div className="text-muted-foreground">Price</div>
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div className="flex items-center gap-1">
                {product.salePrice != null && !isNaN(product.salePrice) ? (
                  <>
                    <span className="line-through text-muted-foreground">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="font-bold text-green-600 animate-pulse">
                      {formatCurrency(product.salePrice)}
                    </span>
                  </>
                ) : (
                  <span>{formatCurrency(product.price)}</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <div className="text-muted-foreground">Category</div>
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div className="truncate">{categoryName}</div>
            )}
          </div>
          
          <div>
            <div className="text-muted-foreground">Stock</div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : updatingStockId === product.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={product.stock}
                  min="0"
                  className="w-24 h-8 text-center transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  onBlur={(e) => {
                    const newStock = parseInt(e.target.value)
                    if (!isNaN(newStock) && newStock !== product.stock) {
                      onStockUpdate(product.id, newStock)
                    }
                  }}
                  disabled={updatingStockId !== null}
                />
                {product.stock < 10 && product.stock > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />}
                {product.stock === 0 && <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />}
              </div>
            )}
          </div>
          
          <div>
            <div className="text-muted-foreground">Value</div>
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div className="font-medium">
                {formatCurrency((product.salePrice || product.price) * product.stock)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="justify-center">
        {isLoading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <Badge 
            variant={stockVariant}
            className="w-full text-center transition-all duration-300 animate-pulse-once"
          >
            {stockStatus}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

// Product form component with animations
const ProductForm = ({
  product,
  categories,
  onSave,
  onCancel,
  isSaving,
  formErrors,
  selectedCategoryId,
  setSelectedCategoryId
}: {
  product?: Product;
  categories: Category[];
  onSave: (formData: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  formErrors: Partial<Record<string, string>>;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
}) => {
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const formSubcategories = selectedCategory?.subcategories || [];
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    const formData = Object.fromEntries(
      Array.from(new FormData(formRef.current)).map(([key, value]) => [key, value.toString()])
    );
    
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto animate-scaleIn">
        <CardHeader className="flex flex-row justify-between items-center sticky top-0 bg-background z-10">
          <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Close form"
            className="transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name || ""}
                placeholder="Enter product name"
                className={`transition-all duration-200 ${formErrors.name ? "border-destructive animate-shake" : "focus:ring-2 focus:ring-blue-500"}`}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1 animate-fadeIn">{formErrors.name}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description || ""}
                placeholder="Enter product description"
                rows={3}
                className={`transition-all duration-200 ${formErrors.description ? "border-destructive animate-shake" : "focus:ring-2 focus:ring-blue-500"}`}
              />
              {formErrors.description && (
                <p className="text-sm text-destructive mt-1 animate-fadeIn">{formErrors.description}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="price">Price (৳) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price?.toString() || ""}
                placeholder="0.00"
                className={`transition-all duration-200 ${formErrors.price ? "border-destructive animate-shake" : "focus:ring-2 focus:ring-blue-500"}`}
              />
              {formErrors.price && (
                <p className="text-sm text-destructive mt-1 animate-fadeIn">{formErrors.price}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="salePrice">Sale Price (৳)</Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.salePrice?.toString() || ""}
                placeholder="0.00"
                className={`transition-all duration-200 ${formErrors.salePrice ? "border-destructive animate-shake" : "focus:ring-2 focus:ring-blue-500"}`}
              />
              {formErrors.salePrice && (
                <p className="text-sm text-destructive mt-1 animate-fadeIn">{formErrors.salePrice}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={product?.stock?.toString() || ""}
                placeholder="0"
                className={`transition-all duration-200 ${formErrors.stock ? "border-destructive animate-shake" : "focus:ring-2 focus:ring-blue-500"}`}
              />
              {formErrors.stock && (
                <p className="text-sm text-destructive mt-1 animate-fadeIn">{formErrors.stock}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku || ""}
                placeholder="Product SKU"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.weight?.toString() || ""}
                placeholder="0.00"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select 
                name="categoryId" 
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className={`transition-all duration-200 ${formErrors.categoryId ? "border-destructive animate-shake" : "focus:ring-2 focus:ring-blue-500"}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="animate-scaleIn">
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id} className="transition-colors duration-200 hover:bg-blue-50">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && (
                <p className="text-sm text-destructive mt-1 animate-fadeIn">{formErrors.categoryId}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="subcategoryId">Subcategory</Label>
              <Select 
                name="subcategoryId" 
                defaultValue={product?.subcategoryId || ""}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent className="animate-scaleIn">
                  <SelectItem value="">None</SelectItem>
                  {formSubcategories.map(sub => (
                    <SelectItem key={sub.id} value={sub.id} className="transition-colors duration-200 hover:bg-blue-50">{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2 sticky bottom-0 bg-background z-10">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSaving}
              type="button"
              className="transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="transition-all duration-200 hover:scale-105"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : product ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [allProducts, allCategories] = await Promise.all([
        storeManager.getProducts(),
        storeManager.getCategories()
      ]);
      setProducts(allProducts || []);
      setCategories(allCategories || []);
    } catch (err) {
      toast.error("Failed to load data", {
        description: "Please try again later"
      });
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    if (loading) return [];
    
    let filtered = [...products];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        (p.sku || "").toLowerCase().includes(term)
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.categoryId === categoryFilter);
    }
    
    return filtered;
  }, [products, searchTerm, categoryFilter, loading]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.salePrice || p.price) * p.stock, 0);
    
    return { totalProducts, lowStock, outOfStock, inventoryValue };
  }, [products]);

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
    setFormErrors({});
    setUpdatingStockId(null);
    setSavingProduct(false);
    setSelectedCategoryId('');
  };

  const validateForm = (formData: Record<string, string>) => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    else if (formData.name.length < 2) errors.name = "Name too short";
    
    if (!formData.description.trim()) errors.description = "Description is required";
    else if (formData.description.length < 10) errors.description = "Description too short";
    
    if (!formData.price) errors.price = "Price is required";
    else if (parseFloat(formData.price) <= 0) errors.price = "Invalid price";
    
    if (!formData.stock) errors.stock = "Stock is required";
    else if (parseInt(formData.stock) < 0) errors.stock = "Invalid stock";
    
    if (!formData.categoryId) errors.categoryId = "Category is required";
    
    if (formData.salePrice.trim() !== "") {
      const salePriceVal = parseFloat(formData.salePrice);
      if (isNaN(salePriceVal)) {
        errors.salePrice = "Sale price must be a number";
      } else if (salePriceVal < 0) {
        errors.salePrice = "Sale price cannot be negative";
      } else if (salePriceVal >= parseFloat(formData.price)) {
        errors.salePrice = "Sale price must be less than regular price";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (formData: Record<string, string>) => {
    if (!validateForm(formData)) return;
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      stock: parseInt(formData.stock),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
    };
    
    try {
      setSavingProduct(true);
      
      if (editingProduct) {
        await storeManager.updateProduct(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await storeManager.addProduct(payload);
        toast.success("Product added successfully");
      }
      
      fetchData();
      resetForm();
    } catch (err) {
      toast.error("Operation failed", {
        description: "Could not save product. Please try again."
      });
      console.error("Failed to submit:", err);
    } finally {
      setSavingProduct(false);
    }
  };
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategoryId(product.categoryId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setDeletingProductId(id);
      await storeManager.deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Deletion failed", {
        description: "Could not delete product. Please try again."
      });
      console.error("Delete failed:", err);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleStockUpdate = async (id: string, newStock: number) => {
    if (isNaN(newStock)) return;
    
    try {
      setUpdatingStockId(id);
      await storeManager.updateProduct(id, { stock: newStock });
      toast.success("Stock updated successfully");
      fetchData();
    } catch (err) {
      toast.error("Stock update failed", {
        description: "Please try again later"
      });
      console.error("Stock update failed:", err);
    } finally {
      setUpdatingStockId(null);
    }
  };
  
  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes pulse-once {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-pulse-once {
          animation: pulse-once 1s ease-in-out;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="transition-all duration-200 hover:scale-105"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={() => { 
              setShowForm(true); 
              setEditingProduct(null); 
              setSelectedCategoryId('');
              setFormErrors({});
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>
      
{/* Search & Filter */}
      <Card className="p-4 mb-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="animate-scaleIn">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id} className="transition-colors duration-200 hover:bg-blue-50">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => { 
              setSearchTerm(""); 
              setCategoryFilter("all") 
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fadeIn">
        <StatsCard 
          title="Total Products" 
          value={stats.totalProducts} 
          description="All products in inventory"
        />
        <StatsCard 
          title="Low Stock" 
          value={stats.lowStock} 
          description="Products with less than 10 in stock"
          variant="warning"
        />
        <StatsCard 
          title="Out of Stock" 
          value={stats.outOfStock} 
          description="Products with no stock available"
          variant="danger"
        />
        <StatsCard 
          title="Inventory Value" 
          value={formatCurrency(stats.inventoryValue)} 
          description="Total value of current inventory"
          variant="success"
        />
      </div>
            {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center animate-fadeIn">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Add your first product to get started"}
          </p>
          <Button 
            onClick={() => { 
              setShowForm(true); 
              setEditingProduct(null); 
              setSelectedCategoryId('');
              setFormErrors({});
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(p => (
            <ProductCard 
              key={p.id}
              product={p}
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStockUpdate={handleStockUpdate}
              updatingStockId={updatingStockId}
              deletingProductId={deletingProductId}
              isLoading={loading}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={resetForm}
          isSaving={savingProduct}
          formErrors={formErrors}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />
      )}
    </div>
  );
}
