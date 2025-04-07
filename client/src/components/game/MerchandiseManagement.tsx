import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { MerchandiseItem, MerchandiseType, MerchandiseSize } from '@/lib/types';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, ShoppingBagIcon, TrendingUpIcon } from 'lucide-react';

const MerchandiseManagement: React.FC = () => {
  const { 
    stats, 
    character, 
    merchandiseItems = [], 
    merchandiseSales = [], 
    currentWeek,
    subscriptionInfo,
    setScreen,
    addMerchandiseItem,
    updateMerchandiseItem,
    deleteMerchandiseItem
  } = useRapperGame();

  const [activeTab, setActiveTab] = useState<string>('manage');
  
  // Form state for creating new merchandise
  const [newMerch, setNewMerch] = useState<Partial<MerchandiseItem>>({
    name: '',
    description: '',
    type: 'clothing' as MerchandiseType,
    price: 25,
    cost: 10,
    imageUrl: '',
    availableInventory: 100,
    isActive: true,
    isLimited: false,
    isPremiumOnly: false,
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Premium check
  const isPremium = subscriptionInfo?.isSubscribed || false;

  // Filter for active and inactive merchandise
  const activeMerch = merchandiseItems.filter(item => item.isActive);
  const inactiveMerch = merchandiseItems.filter(item => !item.isActive);

  // Calculate total sales
  const totalSales = merchandiseItems.reduce((total, item) => total + item.totalSold, 0);
  const totalRevenue = merchandiseItems.reduce((total, item) => total + item.revenue, 0);
  const totalProfit = merchandiseItems.reduce((total, item) => total + item.profit, 0);

  // Go back to dashboard
  const handleBackToDashboard = () => {
    setScreen('career_dashboard');
  };

  // Handle merchandise creation
  const handleCreateMerchandise = () => {
    if (!newMerch.name || !newMerch.description) {
      alert('Please fill out all required fields');
      return;
    }

    if (isEditing && editingId) {
      updateMerchandiseItem(editingId, newMerch as MerchandiseItem);
      setIsEditing(false);
      setEditingId(null);
    } else {
      addMerchandiseItem({
        ...newMerch,
        id: `merch_${Date.now()}`,
        dateAdded: currentWeek,
        totalSold: 0,
        revenue: 0,
        profit: 0,
      } as MerchandiseItem);
    }

    // Reset form
    setNewMerch({
      name: '',
      description: '',
      type: 'clothing' as MerchandiseType,
      price: 25,
      cost: 10,
      imageUrl: '',
      availableInventory: 100,
      isActive: true,
      isLimited: false,
      isPremiumOnly: false,
    });
  };

  // Handle edit merchandise
  const handleEditMerchandise = (item: MerchandiseItem) => {
    setNewMerch(item);
    setIsEditing(true);
    setEditingId(item.id);
  };

  // Handle toggle active status
  const handleToggleActive = (id: string, isActive: boolean) => {
    updateMerchandiseItem(id, { isActive });
  };

  // Handle delete merchandise
  const handleDeleteMerchandise = (id: string) => {
    if (window.confirm('Are you sure you want to delete this merchandise item?')) {
      deleteMerchandiseItem(id);
    }
  };

  // Navigate to sales charts
  const handleViewSalesCharts = () => {
    setScreen('merchandise_sales_charts');
  };

  // Calculate profit margin
  const calculateProfitMargin = (price: number, cost: number) => {
    return ((price - cost) / price) * 100;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-background z-10 py-2">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center shadow-lg mr-3">
            <ShoppingBagIcon size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Merchandise Management</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleViewSalesCharts}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center gap-2"
          >
            <TrendingUpIcon size={16} />
            Sales Charts
          </Button>
          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeftIcon size={16} className="mr-1" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalSales.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{activeMerch.length} active products</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Lifetime sales revenue</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalProfit.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {totalRevenue > 0 ? 
                `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : 
                'No sales yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue="manage" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="manage">Manage Products</TabsTrigger>
          <TabsTrigger value="create">Create New Product</TabsTrigger>
        </TabsList>

        {/* Manage Products Tab */}
        <TabsContent value="manage" className="mt-0">
          <h2 className="text-xl font-bold mb-4">Active Products</h2>
          
          {activeMerch.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg mb-8">
              <p className="text-muted-foreground">You don't have any active merchandise yet.</p>
              <Button 
                onClick={() => setActiveTab('create')} 
                className="mt-4"
              >
                Create Your First Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {activeMerch.map(item => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-all">
                  {item.imageUrl ? (
                    <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <ShoppingBagIcon size={48} className="text-gray-400" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </div>
                      {item.isPremiumOnly && (
                        <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full uppercase font-bold">
                          Premium
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-2 pb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">${item.price}</span>
                      <span className="text-sm text-muted-foreground">
                        Cost: ${item.cost} 
                        <span className="ml-1 text-green-600">
                          ({calculateProfitMargin(item.price, item.cost).toFixed(0)}% margin)
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Type: {item.type}</span>
                      <span>{item.totalSold} sold</span>
                    </div>
                    
                    {item.isLimited && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600 font-medium">Limited Edition</span>
                        <span>
                          {item.availableInventory} / {item.limitedQuantity} remaining
                        </span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-2 pt-0">
                    <div className="w-full grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleEditMerchandise(item)}
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleToggleActive(item.id, false)}
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        Deactivate
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {inactiveMerch.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">Inactive Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inactiveMerch.map(item => (
                  <Card key={item.id} className="opacity-60 hover:opacity-100 transition-opacity">
                    <CardHeader>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-0">
                      <p className="line-clamp-1 text-sm">{item.description}</p>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>${item.price}</span>
                        <span>{item.totalSold} sold</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleActive(item.id, true)}
                      >
                        Reactivate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteMerchandise(item.id)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Create New Product Tab */}
        <TabsContent value="create" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Update Merchandise' : 'Create New Merchandise'}</CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Make changes to your merchandise item' 
                  : 'Add a new merchandise item to your store'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      value={newMerch.name} 
                      onChange={(e) => setNewMerch({...newMerch, name: e.target.value})}
                      placeholder="T-Shirt with Logo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      value={newMerch.description} 
                      onChange={(e) => setNewMerch({...newMerch, description: e.target.value})}
                      placeholder="Comfortable cotton t-shirt with your logo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Product Type</Label>
                    <Select 
                      value={newMerch.type as string} 
                      onValueChange={(value: MerchandiseType) => setNewMerch({...newMerch, type: value})}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="collectibles">Collectibles</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="limited">Limited Edition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      value={newMerch.imageUrl} 
                      onChange={(e) => setNewMerch({...newMerch, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">Selling Price: ${newMerch.price}</Label>
                    <Slider
                      id="price"
                      min={5}
                      max={200}
                      step={5}
                      value={[newMerch.price || 25]}
                      onValueChange={(value) => setNewMerch({...newMerch, price: value[0]})}
                      className="my-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cost">Production Cost: ${newMerch.cost}</Label>
                    <Slider
                      id="cost"
                      min={1}
                      max={100}
                      step={1}
                      value={[newMerch.cost || 10]}
                      onValueChange={(value) => setNewMerch({...newMerch, cost: value[0]})}
                      className="my-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="inventory">Initial Inventory: {newMerch.availableInventory}</Label>
                    <Slider
                      id="inventory"
                      min={10}
                      max={1000}
                      step={10}
                      value={[newMerch.availableInventory || 100]}
                      onValueChange={(value) => setNewMerch({...newMerch, availableInventory: value[0]})}
                      className="my-2"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch 
                      id="isLimited" 
                      checked={newMerch.isLimited} 
                      onCheckedChange={(checked) => setNewMerch({...newMerch, isLimited: checked})}
                    />
                    <Label htmlFor="isLimited">Limited Edition</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isPremiumOnly" 
                      checked={newMerch.isPremiumOnly} 
                      onCheckedChange={(checked) => setNewMerch({...newMerch, isPremiumOnly: checked})}
                      disabled={!isPremium}
                    />
                    <Label htmlFor="isPremiumOnly" className={!isPremium ? "text-muted-foreground" : ""}>
                      Premium-Only Product
                      {!isPremium && <span className="block text-xs text-amber-500">Requires premium subscription</span>}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setActiveTab('manage');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMerchandise}
                className="bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchandiseManagement;