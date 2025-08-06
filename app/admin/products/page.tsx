// app/admin/products/page.tsx

"use client"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeManager } from "@/lib/store"
import { Search, Plus, Edit, AlertTriangle, Package, X, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Product, Category } from "@/types"

interface ProductFormData {
  name: string
  description: string
  price: string
  salePrice: string
  stock: string
  categoryId: string
  subcategoryId: string
  sku: string
  weight: string
}

// Helper function to format currency
function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return "৳" + value.toFixed(2);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({})
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [isStockUpdating, setIsStockUpdating] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  const isMountedRef = useRef(true)

  // Debugging useEffect
  useEffect(() => {
    console.log("[DEBUG] Editing product changed:", editingProduct);
    console.log("[DEBUG] Selected category ID:", selectedCategoryId);
    console.log("[DEBUG] Form errors:", formErrors);
  }, [editingProduct, selectedCategoryId, formErrors]);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return
    
    try {
      setLoading(true)
      const [allProducts, allCategories] = await Promise.all([
        storeManager.getProducts(),
        storeManager.getCategories()
      ])
      setProducts(allProducts)
      setCategories(allCategories)
      console.log("[DEBUG] Fetched products:", allProducts);
      console.log("[DEBUG] Fetched categories:", allCategories);
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    fetchData()

    const unsubscribe = storeManager.subscribe(() => {
      if (!loading) fetchData()
    })

    return () => {
      isMountedRef.current = false
      unsubscribe()
    }
  }, [fetchData])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
      )
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.categoryId === categoryFilter)
    }
    
    return filtered
  }, [products, searchTerm, categoryFilter])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length
    const outOfStock = products.filter(p => p.stock === 0).length
    const inventoryValue = products.reduce((sum, p) => sum + (p.salePrice || p.price) * p.stock, 0)
    
    return { totalProducts, lowStock, outOfStock, inventoryValue }
  }, [products])

  const resetForm = () => {
    setEditingProduct(null)
    setShowForm(false)
    setFormErrors({})
    setActiveProductId(null)
    setIsStockUpdating(false)
    setSelectedCategoryId('')
  }

  const validateForm = (formData: ProductFormData) => {
    const errors: Partial<ProductFormData> = {}
    
    if (!formData.name.trim()) errors.name = "Name is required"
    else if (formData.name.length < 2) errors.name = "Name too short"
    
    if (!formData.description.trim()) errors.description = "Description is required"
    else if (formData.description.length < 10) errors.description = "Description too short"
    
    if (!formData.price) errors.price = "Price is required"
    else if (parseFloat(formData.price) <= 0) errors.price = "Invalid price"
    
    if (!formData.stock) errors.stock = "Stock is required"
    else if (parseInt(formData.stock) < 0) errors.stock = "Invalid stock"
    
    if (!formData.categoryId) errors.categoryId = "Category is required"
    
    // Add sale price validation
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
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData: ProductFormData = {
      name: (e.target as any).name.value,
      description: (e.target as any).description.value,
      price: (e.target as any).price.value,
      salePrice: (e.target as any).salePrice.value,
      stock: (e.target as any).stock.value,
      categoryId: (e.target as any).categoryId.value,
      subcategoryId: (e.target as any).subcategoryId.value,
      sku: (e.target as any).sku.value,
      weight: (e.target as any).weight.value
    }
    
    if (!validateForm(formData)) return
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      stock: parseInt(formData.stock),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
    }
    
    try {
      setActiveProductId(editingProduct?.id || null)
      setIsStockUpdating(true)
      
      if (editingProduct) {
        await storeManager.updateProduct(editingProduct.id, payload)
        toast.success("Product updated successfully")
      } else {
        await storeManager.addProduct(payload)
        toast.success("Product added successfully")
      }
      
      fetchData()
      resetForm()
    } catch (err) {
      toast.error("Operation failed", {
        description: "Could not save product. Please try again."
      })
      console.error("Failed to submit:", err)
    } finally {
      setIsStockUpdating(false)
      setActiveProductId(null)
    }
  }

  const handleEdit = (product: Product) => {
    try {
      console.log("[DEBUG] Editing product data:", JSON.stringify(product, null, 2));
      setEditingProduct(product);
      setSelectedCategoryId(product.categoryId);
      setShowForm(true);
    } catch (error) {
      console.error("[ERROR] Failed to load product for editing:", error);
      toast.error("Edit failed", {
        description: "Could not load product data. Check console for details."
      });
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActiveProductId(id)
      await storeManager.deleteProduct(id)
      toast.success("Product deleted successfully")
      fetchData()
    } catch (err) {
      toast.error("Deletion failed", {
        description: "Could not delete product. Please try again."
      })
      console.error("Delete failed:", err)
    } finally {
      setActiveProductId(null)
    }
  }

  const handleStockUpdate = async (id: string, newStock: number) => {
    if (isNaN(newStock)) return
    
    try {
      setActiveProductId(id)
      setIsStockUpdating(true)
      await storeManager.updateProduct(id, { stock: newStock })
      fetchData()
      toast.success("Stock updated successfully")
    } catch (err) {
      toast.error("Stock update failed", {
        description: "Please try again later"
      })
      console.error("Stock update failed:", err)
    } finally {
      setIsStockUpdating(false)
      setActiveProductId(null)
    }
  }

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const formSubcategories = selectedCategory?.subcategories || []

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <Button onClick={() => { 
          setShowForm(true); 
          setEditingProduct(null); 
          setSelectedCategoryId('');
          setFormErrors({});
        }}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => { 
            setSearchTerm(""); setCategoryFilter("all") 
          }}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <div className="text-sm text-muted-foreground">Total Products</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
          <div className="text-sm text-muted-foreground">Low Stock</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          <div className="text-sm text-muted-foreground">Out of Stock</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ৳{stats.inventoryValue.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Inventory Value</div>
        </Card>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or add a new product
          </p>
          <Button onClick={() => { 
            setShowForm(true); 
            setEditingProduct(null); 
            setSelectedCategoryId('');
            setFormErrors({});
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{p.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleEdit(p)}
                      disabled={activeProductId === p.id}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(p.id)}
                      disabled={activeProductId === p.id}
                    >
                      {activeProductId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{p.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">ID</div>
                    <div className="font-mono truncate">{p.id}</div>
                  </div>
                  {p.sku && (
                    <div>
                      <div className="text-muted-foreground">SKU</div>
                      <div className="truncate">{p.sku}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Price</div>
                    <div className="flex items-center gap-1">
                      {p.salePrice != null && !isNaN(p.salePrice) ? (
                        <>
                          <span className="line-through text-muted-foreground">
                            {formatCurrency(p.price)}
                          </span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(p.salePrice)}
                          </span>
                        </>
                      ) : (
                        <span>{formatCurrency(p.price)}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="truncate">
                      {categories.find(c => c.id === p.categoryId)?.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stock</div>
                    <div className="flex items-center gap-2">
                      {isStockUpdating && activeProductId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Input
                          type="number"
                          defaultValue={p.stock}
                          min="0"
                          className="w-24 h-8 text-center"
                          onBlur={(e) => {
                            const newStock = parseInt(e.target.value)
                            if (!isNaN(newStock) && newStock !== p.stock) {
                              handleStockUpdate(p.id, newStock)
                            }
                          }}
                          disabled={isStockUpdating && activeProductId !== p.id}
                        />
                      )}
                      {p.stock < 10 && p.stock > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {p.stock === 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Value</div>
                    <div className="font-medium">
                      ৳{((p.salePrice || p.price) * p.stock).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="justify-center">
                <Badge 
                  variant={p.stock === 0 ? "destructive" : p.stock < 10 ? "warning" : "success"}
                  className="w-full text-center"
                >
                  {p.stock === 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock"}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingProduct?.name || ""}
                    placeholder="Enter product name"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProduct?.description || ""}
                    placeholder="Enter product description"
                    rows={3}
                    className={formErrors.description ? "border-red-500" : ""}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
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
                    defaultValue={editingProduct?.price?.toString() || ""}
                    placeholder="0.00"
                    className={formErrors.price ? "border-red-500" : ""}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
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
                    defaultValue={editingProduct?.salePrice?.toString() || ""}
                    placeholder="0.00"
                    className={formErrors.salePrice ? "border-red-500" : ""}
                  />
                  {formErrors.salePrice && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.salePrice}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.stock?.toString() || ""}
                    placeholder="0"
                    className={formErrors.stock ? "border-red-500" : ""}
                  />
                  {formErrors.stock && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.stock}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={editingProduct?.sku || ""}
                    placeholder="Product SKU"
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
                    defaultValue={editingProduct?.weight?.toString() || ""}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select 
                    name="categoryId" 
                    value={selectedCategoryId}
                    onValueChange={setSelectedCategoryId}
                  >
                    <SelectTrigger className={formErrors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.categoryId}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="subcategoryId">Subcategory</Label>
                  <Select 
                    name="subcategoryId" 
                    defaultValue={editingProduct?.subcategoryId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {formSubcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={isStockUpdating}>
                  {isStockUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                  </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
