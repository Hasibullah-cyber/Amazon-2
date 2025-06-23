
"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeManager } from "@/lib/store"
import { Plus, Edit, Trash2, FolderPlus, X } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    const updateCategories = () => {
      const allCategories = storeManager.getCategories()
      setCategories(allCategories)
    }

    updateCategories()
    const unsubscribe = storeManager.subscribe(updateCategories)

    return unsubscribe
  }, [])

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    storeManager.addCategory(formData)
    resetForm()
  }

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    storeManager.addSubcategory(selectedCategory, formData)
    resetSubcategoryForm()
  }

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setShowAddForm(false)
  }

  const resetSubcategoryForm = () => {
    setFormData({ name: "", description: "" })
    setShowSubcategoryForm(false)
    setSelectedCategory("")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{category.name}</h3>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedCategory(category.id)
                  setShowSubcategoryForm(true)
                }}
              >
                <FolderPlus className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-gray-600 mb-4">{category.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Subcategories:</h4>
              {category.subcategories?.length > 0 ? (
                <ul className="space-y-1">
                  {category.subcategories.map((sub: any) => (
                    <li key={sub.id} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-gray-600 text-xs">{sub.description}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No subcategories</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Category</h2>
                <Button variant="outline" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Add Category</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showSubcategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Subcategory</h2>
                <Button variant="outline" size="icon" onClick={resetSubcategoryForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subcategory Name</label>
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Add Subcategory</Button>
                  <Button type="button" variant="outline" onClick={resetSubcategoryForm}>Cancel</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
