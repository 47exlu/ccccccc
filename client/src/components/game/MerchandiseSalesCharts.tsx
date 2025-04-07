import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { MerchandiseItem, MerchandiseWeeklySales } from '@/lib/types';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, ShoppingBagIcon, TrendingUpIcon, DollarSignIcon, BarChart3Icon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

// Constants
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const MerchandiseSalesCharts: React.FC = () => {
  const { 
    merchandiseItems = [], 
    merchandiseSales = [], 
    setScreen,
  } = useRapperGame();

  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overall');
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);

  // Filter merchandise sales data based on timeframe
  const getFilteredSalesData = () => {
    if (selectedTimeframe === 'all') {
      return merchandiseSales;
    }
    
    const weeks = parseInt(selectedTimeframe);
    const cutoffIndex = Math.max(0, merchandiseSales.length - weeks);
    return merchandiseSales.slice(cutoffIndex);
  };

  // Format data for overall sales chart
  const getOverallSalesData = () => {
    return getFilteredSalesData().map(sale => ({
      week: `Week ${sale.week}`,
      revenue: sale.totalRevenue,
      profit: sale.totalProfit,
      items: sale.totalItems
    }));
  };

  // Format data for item comparison chart
  const getItemComparisonData = () => {
    // Get total sales per item
    const itemSales: Record<string, { revenue: number; profit: number; items: number; name: string }> = {};
    
    // Initialize with all merchandise items
    merchandiseItems.forEach(item => {
      itemSales[item.id] = {
        revenue: 0,
        profit: 0,
        items: 0,
        name: item.name
      };
    });
    
    // Add up sales from weekly data
    getFilteredSalesData().forEach(sale => {
      Object.entries(sale.itemsSold).forEach(([itemId, quantity]) => {
        if (itemSales[itemId]) {
          const item = merchandiseItems.find(m => m.id === itemId);
          if (item) {
            itemSales[itemId].items += quantity;
            itemSales[itemId].revenue += quantity * item.price;
            itemSales[itemId].profit += quantity * (item.price - item.cost);
          }
        }
      });
    });
    
    // Convert to array format for charts
    return Object.entries(itemSales)
      .map(([id, data]) => ({
        name: data.name,
        revenue: data.revenue,
        profit: data.profit,
        items: data.items,
        id
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Format data for product distribution chart (pie chart)
  const getProductDistributionData = () => {
    const itemData = getItemComparisonData();
    // Filter out items with no sales
    return itemData.filter(item => item.items > 0);
  };

  // Go back to merchandise management
  const handleBackToMerchandise = () => {
    setScreen('merchandise');
  };

  // Go back to dashboard
  const handleBackToDashboard = () => {
    setScreen('career_dashboard');
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-md shadow-md p-3">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for items chart
  const ItemsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-md shadow-md p-3">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} {entry.dataKey === 'items' ? 'items' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${value} items (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center shadow-lg mr-3">
            <BarChart3Icon size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Merchandise Sales Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleBackToMerchandise}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-2"
          >
            <ShoppingBagIcon size={16} />
            Manage Merchandise
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

      {/* Time Frame Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Sales Performance</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">Last 4 Weeks</SelectItem>
              <SelectItem value="8">Last 8 Weeks</SelectItem>
              <SelectItem value="12">Last 12 Weeks</SelectItem>
              <SelectItem value="24">Last 24 Weeks</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* No Data Message */}
      {merchandiseSales.length === 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mb-4 flex justify-center">
              <BarChart3Icon size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Sales Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Once you start selling merchandise, your sales data will appear here.
            </p>
            <Button onClick={handleBackToMerchandise}>
              Create Merchandise Products
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {merchandiseSales.length > 0 && (
        <Tabs 
          defaultValue="overall" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="overall">Overall Sales</TabsTrigger>
            <TabsTrigger value="comparison">Product Comparison</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* Overall Sales Tab */}
          <TabsContent value="overall" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Items Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {getFilteredSalesData().reduce((total, sale) => total + sale.totalItems, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${getFilteredSalesData().reduce((total, sale) => total + sale.totalRevenue, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${getFilteredSalesData().reduce((total, sale) => total + sale.totalProfit, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Weekly Revenue & Profit</CardTitle>
                <CardDescription>
                  Track your merchandise sales performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getOverallSalesData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="week" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ bottom: 0 }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar dataKey="profit" name="Profit" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Items Sold</CardTitle>
                <CardDescription>
                  Number of merchandise items sold each week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getOverallSalesData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="week" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip content={<ItemsTooltip />} />
                      <Legend wrapperStyle={{ bottom: 0 }} />
                      <Line 
                        type="monotone" 
                        dataKey="items" 
                        name="Items Sold" 
                        stroke="#ff7300" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Comparison Tab */}
          <TabsContent value="comparison" className="mt-0">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
                <CardDescription>
                  Compare the revenue performance of different merchandise items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getItemComparisonData()}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar dataKey="profit" name="Profit" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Sold by Product</CardTitle>
                <CardDescription>
                  Compare the number of each product sold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getItemComparisonData()}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<ItemsTooltip />} />
                      <Legend />
                      <Bar dataKey="items" name="Items Sold" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Distribution by Product</CardTitle>
                  <CardDescription>
                    Proportion of total sales by merchandise item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          data={getProductDistributionData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="items"
                          nameKey="name"
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                          onMouseLeave={() => setActivePieIndex(undefined)}
                        >
                          {getProductDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution by Product</CardTitle>
                  <CardDescription>
                    Proportion of total revenue by merchandise item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getProductDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="name"
                        >
                          {getProductDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MerchandiseSalesCharts;