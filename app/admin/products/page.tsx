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
  // State management with proper typing
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
  
  // State for category + subcategory (controlled select)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('')

  // Ref to track component mount state for safe state updates
  const isMountedRef = useRef(true)

  // Debugging useEffect - helps track state changes during development
  useEffect(() => {
    console.log("[DEBUG] Editing product changed:", editingProduct);
    console.log("[DEBUG] Selected category ID:", selectedCategoryId);
    console.log("[DEBUG] Selected subcategory ID:", selectedSubcategoryId);
    console.log("[DEBUG] Form errors:", formErrors);
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMountedRef.current = false;
    }
  }, [editingProduct, selectedCategoryId, selectedSubcategoryId, formErrors]);

  // Fetch product and category data
  const fetchData = useCallback(async () => {
    // Avoid state updates if component is unmounted
    if (!isMountedRef.current) return
    
    try {
      setLoading(true)
      // Fetch products and categories in parallel
      const [allProducts, allCategories] = await Promise.all([
        storeManager.getProducts(),
        storeManager.getCategories()
      ])
      
      // Update state only if component is still mounted
      if (isMountedRef.current) {
        setProducts(allProducts)
        setCategories(allCategories)
      }
    } catch (err) {
      console.error("Failed to load data:", err)
      toast.error("Data load failed", {
        description: "Could not fetch products and categories"
      })
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Initial data fetch and setup store subscription
  useEffect(() => {
    isMountedRef.current = true
    fetchData()

    // Subscribe to store changes
    const unsubscribe = storeManager.subscribe(() => {
      if (!loading && isMountedRef.current) {
        fetchData()
      }
    })

    // Cleanup on component unmount
    return () => {
      isMountedRef.current = false
      unsubscribe()
    }
  }, [fetchData])

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    let filtered = [...products]
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
      )
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.categoryId === categoryFilter)
    }
    
    return filtered
  }, [products, searchTerm, categoryFilter])

  // Calculate inventory stats
  const stats = useMemo(() => {
    const totalProducts = products.length
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length
    const outOfStock = products.filter(p => p.stock === 0).length
    const inventoryValue = products.reduce((sum, p) => sum + (p.salePrice || p.price) * p.stock, 0)
    
    return { totalProducts, lowStock, outOfStock, inventoryValue }
  }, [products])

  // Reset form to initial state
  const resetForm = () => {
    setEditingProduct(null)
    setShowForm(false)
    setFormErrors({})
    setActiveProductId(null)
    setIsStockUpdating(false)
    setSelectedCategoryId('')
    setSelectedSubcategoryId('')
  }

  // Validate form inputs
  const validateForm = (formData: ProductFormData) => {
    const errors: Partial<ProductFormData> = {}
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters"
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters"
    }
    
    // Price validation
    if (!formData.price) {
      errors.price = "Price is required"
    } else {
      const priceVal = parseFloat(formData.price)
      if (isNaN(priceVal) || priceVal <= 0) {
        errors.price = "Invalid price"
      }
    }
    
    // Stock validation
    if (!formData.stock) {
      errors.stock = "Stock is required"
    } else {
      const stockVal = parseInt(formData.stock, 10)
      if (isNaN(stockVal) || stockVal < 0) {
        errors.stock = "Invalid stock quantity"
      }
    }
    
    // Category validation
    if (!formData.categoryId) {
      errors.categoryId = "Category is required"
    }
    
    // Sale price validation
    if (formData.salePrice.trim() !== "") {
      const salePriceVal = parseFloat(formData.salePrice)
      const priceVal = parseFloat(formData.price)
      
      if (isNaN(salePriceVal)) {
        errors.salePrice = "Sale price must be a number"
      } else if (salePriceVal < 0) {
        errors.salePrice = "Sale price cannot be negative"
      } else if (salePriceVal >= priceVal) {
        errors.salePrice = "Sale price must be less than regular price"
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const form = e.target as HTMLFormElement;
    const formData: ProductFormData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      price: (form.elements.namedItem('price') as HTMLInputElement).value,
      salePrice: (form.elements.namedItem('salePrice') as HTMLInputElement).value,
      stock: (form.elements.namedItem('stock') as HTMLInputElement).value,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      sku: (form.elements.namedItem('sku') as HTMLInputElement).value,
      weight: (form.elements.namedItem('weight') as HTMLInputElement).value
    }
    
    // Validate before submission
    if (!validateForm(formData)) return
    
    // Prepare payload with proper data types
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      stock: parseInt(formData.stock, 10),
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

  // Handle product edit
  const handleEdit = (product: Product) => {
    try {
      setEditingProduct(product);
      setSelectedCategoryId(product.categoryId);
      setSelectedSubcategoryId(product.subcategoryId || "");
      setShowForm(true);
    } catch (error) {
      console.error("[ERROR] Failed to load product for editing:", error);
      toast.error("Edit failed", {
        description: "Could not load product data. Check console for details."
      });
    }
  }

  // Handle product deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
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

  // Handle stock updates
  const handleStockUpdate = async (id: string, newStock: number) => {
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Invalid stock value", {
        description: "Stock must be a non-negative number"
      })
      return;
    }
    
    try {
      setActiveProductId(id)
      setIsStockUpdating(true)
      await storeManager.updateProduct(id, { stock: newStock })
      toast.success("Stock updated successfully")
      fetchData()
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

  // Get selected category and its subcategories
  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const formSubcategories = selectedCategory?.subcategories || []

  // Loading state UI
  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 rounded-xl">
              <Skeleton className="h-6 w-16 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-4 w-24 mx-auto rounded-full" />
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 rounded-xl transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-5 w-32 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2 rounded-lg" />
              <Skeleton className="h-4 w-3/4 mb-2 rounded-lg" />
              <Skeleton className="h-4 w-24 mb-4 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Products Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <Button 
          onClick={() => { 
            setShowForm(true); 
            setEditingProduct(null); 
            setSelectedCategoryId('');
            setSelectedSubcategoryId('');
            setFormErrors({});
          }}
          className="transition-transform duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search & Filter Section */}
      <Card className="p-4 mb-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative animate-fade-in-down">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="rounded-lg animate-fade-in-down animation-delay-100">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => { 
              setSearchTerm(""); 
              setCategoryFilter("all") 
            }}
            className="rounded-lg animate-fade-in-down animation-delay-200"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <div className="text-sm text-muted-foreground">Total Products</div>
        </Card>
        
        <Card className="p-4 text-center rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
          <div className="text-sm text-muted-foreground">Low Stock</div>
        </Card>
        
        <Card className="p-4 text-center rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          <div className="text-sm text-muted-foreground">Out of Stock</div>
        </Card>
        
        <Card className="p-4 text-center rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-green-600">
            ৳{stats.inventoryValue.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Inventory Value</div>
        </Card>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center rounded-xl shadow-lg animate-bounce-in">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or add a new product
          </p>
          <Button 
            onClick={() => { 
              setShowForm(true); 
              setEditingProduct(null); 
              setSelectedCategoryId('');
              setSelectedSubcategoryId('');
              setFormErrors({});
            }}
            className="transition-transform duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(p => (
            <Card 
              key={p.id} 
              className="overflow-hidden rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{p.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-7 w-7 transition-transform duration-300 hover:scale-110"
                      onClick={() => handleEdit(p)}
                      disabled={activeProductId === p.id}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-700 transition-transform duration-300 hover:scale-110"
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
                          className="w-24 h-8 text-center rounded-lg"
                          onBlur={(e) => {
                            const newStock = parseInt(e.target.value, 10)
                            if (!isNaN(newStock) && newStock !== p.stock) {
                              handleStockUpdate(p.id, newStock)
                            } else {
                                       // Reset to original value if invalid
                              e.target.value = p.stock.toString()
                            }
                          }}
                          disabled={isStockUpdating && activeProductId !== p.id}
                        />
                      )}
                      {p.stock < 10 && p.stock > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
                      )}
                      {p.stock === 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                      )}
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
                  className="w-full text-center rounded-lg transition-colors duration-300"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl rounded-xl animate-pop-in">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetForm}
                className="transition-transform duration-300 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingProduct?.name || ""}
                    placeholder="Enter product name"
                    className={formErrors.name ? "border-red-500 rounded-lg" : "rounded-lg"}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1 animate-shake">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProduct?.description || ""}
                    placeholder="Enter product description"
                    rows={3}
                    className={formErrors.description ? "border-red-500 rounded-lg" : "rounded-lg"}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-500 mt-1 animate-shake">{formErrors.description}</p>
                  )}
                </div>
                    {/* Price */}
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
                    className={formErrors.price ? "border-red-500 rounded-lg" : "rounded-lg"}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-red-500 mt-1 animate-shake">{formErrors.price}</p>
                  )}
                </div>
                
                {/* Sale Price */}
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
                    className={formErrors.salePrice ? "border-red-500 rounded-lg" : "rounded-lg"}
                  />
                  {formErrors.salePrice && (
                    <p className="text-sm text-red-500 mt-1 animate-shake">{formErrors.salePrice}</p>
                  )}
                </div>
                
                {/* Stock */}
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.stock?.toString() || ""}
                    placeholder="0"
                    className={formErrors.stock ? "border-red-500 rounded-lg" : "rounded-lg"}
                  />
                  {formErrors.stock && (
                    <p className="text-sm text-red-500 mt-1 animate-shake">{formErrors.stock}</p>
                  )}
                </div>
                {/* SKU */}
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={editingProduct?.sku || ""}
                    placeholder="Product SKU"
                    className="rounded-lg"
                  />
                </div>
                
                {/* Weight */}
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
                    className="rounded-lg"
                  />
                </div>
                
                {/* Category */}
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select 
                    name="categoryId" 
                    value={selectedCategoryId}
                    onValueChange={(value) => {
                      setSelectedCategoryId(value);
                      setSelectedSubcategoryId('');
                    }}
                  >
                    <SelectTrigger className={formErrors.categoryId ? "border-red-500 rounded-lg" : "rounded-lg"}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="rounded-md">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.categoryId && (
                    <p className="text-sm text-red-500 mt-1 animate-shake">{formErrors.categoryId}</p>
                  )}
                </div>
                {/* Subcategory */}
                <div>
                  <Label htmlFor="subcategoryId">Subcategory</Label>
                  <Select 
                    name="subcategoryId" 
                    value={selectedSubcategoryId}
                    onValueChange={setSelectedSubcategoryId}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="" className="rounded-md">None</SelectItem>
                      {formSubcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id} className="rounded-md">{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              
              {/* Form Actions */}
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="rounded-lg transition-transform duration-300 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isStockUpdating}
                  className="rounded-lg transition-transform duration-300 hover:scale-105"
                >
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
      
               {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% { transform: translateY(-50px); opacity: 0; }
          60% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        
        .animate-fade-in-down {
          animation: fade-in 0.5s ease-out, move-down 0.5s ease-out;
        }
        
        @keyframes move-down {
          from { transform: translateY(-10px); }
          to { transform: translateY(0); }
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  )
}       
