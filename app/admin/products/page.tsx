"use client"

// Show console logs & errors on screen (for debugging on phone)
if (typeof window !== "undefined") {
  const debugBox = document.createElement("div")
  debugBox.style.position = "fixed"
  debugBox.style.bottom = "0"
  debugBox.style.left = "0"
  debugBox.style.maxHeight = "40vh"
  debugBox.style.overflowY = "auto"
  debugBox.style.zIndex = "9999"
  debugBox.style.background = "#000"
  debugBox.style.color = "#0f0"
  debugBox.style.fontSize = "12px"
  debugBox.style.padding = "4px"
  debugBox.style.borderTopRightRadius = "6px"
  debugBox.style.width = "100%"
  document.body.appendChild(debugBox)

  const log = console.log
  const error = console.error

  console.log = function (...args) {
    log.apply(console, args)
    const msg = document.createElement("div")
    msg.textContent = "[LOG] " + args.join(" ")
    debugBox.appendChild(msg)
  }

  console.error = function (...args) {
    error.apply(console, args)
    const msg = document.createElement("div")
    msg.style.color = "#f55"
    msg.textContent = "[ERROR] " + args.join(" ")
    debugBox.appendChild(msg)
  }

  window.onerror = function (message, source, lineno, colno, err) {
    const msg = document.createElement("div")
    msg.style.color = "#f55"
    msg.textContent = `[ERROR] ${message} at ${source}:${lineno}:${colno}`
    debugBox.appendChild(msg)
  }
}

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeManager } from "@/lib/store"
import { Search, Plus, Edit, AlertTriangle, Package, X } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
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

  const fetchData = useCallback(async () => {
    try {
      const allProducts = await storeManager.getProducts()
      const allCategories = await storeManager.getCategories()
      setProducts(allProducts)
      setCategories(allCategories)
    } catch (error) {
      console.error("Error loading products and categories:", error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const unsubscribe = storeManager.subscribe(fetchData)
    return unsubscribe
  }, [fetchData])

  useEffect(() => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.includes(searchTerm)
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, categoryFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      subcategory: formData.subcategory,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.0,
      reviews: 0
    }

    try {
      if (editingProduct) {
        await storeManager.updateProduct(editingProduct.id, productData)
      } else {
        await storeManager.addProduct(productData)
      }
      await fetchData()
      resetForm()
    } catch (error) {
      console.error("Failed to submit product:", error)
    }
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

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await storeManager.updateProduct(productId, { stock: newStock })
      await fetchData()
    } catch (error) {
      console.error("Failed to update stock:", error)
    }
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
    setEditingProduct(null)
    setShowAddForm(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by Product Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </Card>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <div className="text-sm text-gray-500 mb-2">ID: {product.id}</div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Price:</span>
                <span className="text-lg font-bold">৳{product.price}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Stock:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={product.stock}
                    min="0"
                    className="w-20 h-8 text-center"
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value)
                      if (!isNaN(newStock) && newStock !== product.stock) {
                        handleStockUpdate(product.id, newStock)
                      }
                    }}
                  />
                  {product.stock < 10 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Category:</span>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {categories.find(c => c.id === product.category)?.name}
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
                <Input
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select subcategory (optional)</option>
                  {categories.find(c => c.id === formData.category)?.subcategories?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
                  }
