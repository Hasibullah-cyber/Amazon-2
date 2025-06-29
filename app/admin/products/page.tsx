"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeManager } from "@/lib/store"
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, X } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "electronics",
    subcategory: ""
  })
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const updateProducts = async () => {
      try {
        const allProducts = await storeManager.getProducts()
        const allCategories = await storeManager.getCategories()
        setProducts(allProducts)
        setCategories(allCategories)
        filterProducts(allProducts, searchTerm, categoryFilter)
      } catch (error) {
        console.error('Error fetching products and categories:', error)
      }
    }

    updateProducts()
    const unsubscribe = storeManager.subscribe(() => {
      updateProducts()
    })

    return unsubscribe
  }, [searchTerm, categoryFilter])

  const filterProducts = (productsList: any[], search: string, category: string) => {
    let filtered = productsList

    if (search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.id.includes(search)
      )
    }

    if (category !== "all") {
      filtered = filtered.filter(product => product.category === category)
    }

    setFilteredProducts(filtered)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.0,
      reviews: 0
    }

    if (editingProduct) {
      storeManager.updateProduct(editingProduct.id, productData)
    } else {
      storeManager.addProduct(productData)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "electronics",
      subcategory: ""
    })
    setShowAddForm(false)
    setEditingProduct(null)
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      subcategory: product.subcategory || ""
    })
    setShowAddForm(true)
  }

  const handleStockUpdate = (productId: string, newStock: number) => {
    storeManager.updateProduct(productId, { stock: newStock })
  }

  const categoryOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    { value: "home-living", label: "Home & Living" },
    { value: "beauty", label: "Beauty & Personal Care" }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Product Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{products.length}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock < 10).length}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {products.filter(p => p.stock === 0).length}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ৳{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Inventory Value</div>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <div className="text-sm text-gray-500 mb-2">ID: {product.id}</div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Price:</span>
                <span className="text-lg font-bold">৳{product.price}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Stock:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleStockUpdate(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 h-8 text-center"
                    min="0"
                  />
                  {product.stock < 10 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Category:</span>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {categoryOptions.find(c => c.value === product.category)?.label}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Value:</span>
                <span className="font-bold">৳{(product.price * product.stock).toFixed(2)}</span>
              </div>
            </div>

            <div className={`mt-3 text-center py-2 rounded text-sm ${
              product.stock === 0 ? "bg-red-100 text-red-800" :
              product.stock < 10 ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }`}>
              {product.stock === 0 ? "Out of Stock" :
               product.stock < 10 ? "Low Stock" :
               "In Stock"}
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </Card>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <Button variant="outline" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (৳)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ""})}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subcategory</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select subcategory (optional)</option>
                    {categories.find(cat => cat.id === formData.category)?.subcategories?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}