"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeManager } from "@/lib/store"
import { Search, Plus, Edit, AlertTriangle, Package, X } from "lucide-react"

export const dynamic = 'force-dynamic'

// Show console logs on screen (for mobile debugging)
if (typeof window !== "undefined") {
  const debugBox = document.createElement("div")
  Object.assign(debugBox.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    maxHeight: "40vh",
    overflowY: "auto",
    zIndex: "9999",
    background: "#000",
    color: "#0f0",
    fontSize: "12px",
    padding: "4px",
    borderTopRightRadius: "6px",
    width: "100%"
  })
  document.body.appendChild(debugBox)

  const appendLog = (type: string, args: any[], color = "#0f0") => {
    const msg = document.createElement("div")
    msg.style.color = color
    msg.textContent = `[${type}] ` + args.join(" ")
    debugBox.appendChild(msg)
  }

  const originalLog = console.log
  const originalError = console.error

  console.log = (...args) => {
    originalLog(...args)
    appendLog("LOG", args)
  }

  console.error = (...args) => {
    originalError(...args)
    appendLog("ERROR", args, "#f55")
  }

  window.onerror = (message, source, lineno, colno) => {
    appendLog("ERROR", [`${message} at ${source}:${lineno}:${colno}`], "#f55")
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
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
      const [allProducts, allCategories] = await Promise.all([
        storeManager.getProducts(),
        storeManager.getCategories()
      ])
      setProducts(allProducts)
      setCategories(allCategories)
    } catch (err) {
      console.error("Failed to load data:", err)
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
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }
    setFilteredProducts(filtered)
  }, [products, searchTerm, categoryFilter])

  const resetForm = () => {
    setEditingProduct(null)
    setShowForm(false)
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "electronics",
      subcategory: ""
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.0,
      reviews: 0
    }
    try {
      if (editingProduct) {
        await storeManager.updateProduct(editingProduct.id, payload)
      } else {
        await storeManager.addProduct(payload)
      }
      fetchData()
      resetForm()
    } catch (err) {
      console.error("Failed to submit:", err)
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
    setShowForm(true)
  }

  const handleStockUpdate = async (id: string, newStock: number) => {
    try {
      await storeManager.updateProduct(id, { stock: newStock })
      fetchData()
    } catch (err) {
      console.error("Stock update failed:", err)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Stats */}
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
            ৳{products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Inventory Value</div>
        </Card>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{p.name}</h3>
              <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{p.description}</p>
            <div className="text-sm text-gray-500 mb-2">ID: {p.id}</div>

            <div className="space-y-2">
              <div className="flex justify-between"><span>Price:</span><span>৳{p.price}</span></div>
              <div className="flex justify-between items-center">
                <span>Stock:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={p.stock}
                    min="0"
                    className="w-20 h-8 text-center"
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value)
                      if (!isNaN(newStock) && newStock !== p.stock) {
                        handleStockUpdate(p.id, newStock)
                      }
                    }}
                  />
                  {p.stock < 10 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span>{categories.find(c => c.id === p.category)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="font-bold">৳{(p.price * p.stock).toFixed(2)}</span>
              </div>
            </div>

            <div className={`mt-3 text-center py-1 rounded text-sm ${
              p.stock === 0 ? "bg-red-100 text-red-800" :
              p.stock < 10 ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }`}>
              {p.stock === 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock"}
            </div>
          </Card>
        ))}
      </div>

      {/* No Products */}
      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center mt-6">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </Card>
      )}

      {/* Add/Edit Product Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? "Edit" : "Add"} Product</h2>
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
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
