import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Plus, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-betting.jpg";

interface Player {
  name: string;
  earnings: Earning[];
  totalEarnings: number;
}

interface Earning {
  match: string;
  amount: number;
  total: number;
  date: string;
}

export default function BettingDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState("");
  const [newEarning, setNewEarning] = useState("");
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const { toast } = useToast();

  // Add a new player
  const handleAddPlayer = () => {
    if (!newPlayer.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a player name.",
        variant: "destructive",
      });
      return;
    }

    if (players.some(p => p.name.toLowerCase() === newPlayer.toLowerCase())) {
      toast({
        title: "Player Exists",
        description: "A player with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    const newPlayerObj: Player = {
      name: newPlayer.trim(),
      earnings: [],
      totalEarnings: 0
    };
    
    setPlayers([...players, newPlayerObj]);
    setNewPlayer("");
    
    toast({
      title: "Player Added",
      description: `${newPlayer} has been added to the dashboard.`,
    });
  };

  // Add new earning for selected player
  const handleAddEarning = () => {
    if (!newEarning || !selectedPlayer) {
      toast({
        title: "Invalid Input",
        description: "Please enter an earning amount and select a player.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newEarning);
    if (isNaN(amount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    const updatedPlayers = players.map((player) => {
      if (player.name === selectedPlayer.name) {
        const newTotal = player.totalEarnings + amount;
        const newEarningEntry: Earning = {
          match: `Ticket ${player.earnings.length + 1}`,
          amount: amount,
          total: newTotal,
          date: new Date().toLocaleDateString()
        };
        
        const updatedEarnings = [...player.earnings, newEarningEntry];
        
        return {
          ...player,
          earnings: updatedEarnings,
          totalEarnings: newTotal
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    setSelectedPlayer(updatedPlayers.find(p => p.name === selectedPlayer.name) || null);
    setNewEarning("");
    
    const isPositive = amount > 0;
    toast({
      title: isPositive ? "Winning Added!" : "Loss Recorded",
      description: `${isPositive ? '+' : ''}R${amount} has been recorded for ${selectedPlayer.name}.`,
    });
  };

  // Calculate dashboard stats
  const totalPlayers = players.length;
  const totalWinnings = players.reduce((sum, player) => sum + player.totalEarnings, 0);
  const profitablePlayers = players.filter(player => player.totalEarnings > 0).length;
  
  // Generate chart data for all players
  const generateAllPlayersData = () => {
    const allMatches = new Set<string>();
    players.forEach(player => {
      player.earnings.forEach(earning => allMatches.add(earning.match));
    });
    
    const sortedMatches = Array.from(allMatches).sort();
    
    return sortedMatches.map(match => {
      const dataPoint: any = { match };
      players.forEach(player => {
        const earning = player.earnings.find(e => e.match === match);
        dataPoint[player.name] = earning ? earning.total : null;
      });
      return dataPoint;
    });
  };

  // Player colors for multi-player chart
  const playerColors = [
    "hsl(var(--success))",
    "hsl(var(--primary))", 
    "hsl(var(--danger))",
    "#8B5CF6", // Purple
    "#F59E0B", // Orange
    "#10B981", // Emerald
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#8B5A2B", // Brown
    "#EC4899"  // Pink
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative bg-gradient-hero py-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-primary-foreground mb-4">
              BetTrack Buddy
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Professional betting performance tracking with advanced analytics and beautiful visualizations
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Players</p>
                  <p className="text-3xl font-bold">{totalPlayers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-smooth cursor-pointer" onClick={() => {
            setShowAllPlayers(true);
            setSelectedPlayer(null);
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className={`text-3xl font-bold ${totalWinnings >= 0 ? 'text-success' : 'text-danger'}`}>
                    R{totalWinnings.toFixed(2)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${totalWinnings >= 0 ? 'text-success' : 'text-danger'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profitable Players</p>
                  <p className="text-3xl font-bold text-success">{profitablePlayers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                  <p className="text-3xl font-bold text-primary">
                    {totalPlayers > 0 ? Math.round((profitablePlayers / totalPlayers) * 100) : 0}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Management */}
          <Card className="lg:col-span-1 shadow-elegant">
            <CardHeader className="bg-gradient-primary rounded-t-lg">
              <CardTitle className="text-primary-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                Player Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter player name"
                    value={newPlayer}
                    onChange={(e) => setNewPlayer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddPlayer} variant="hero" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No players yet. Add your first player above!</p>
                  </div>
                ) : (
                  players.map((player, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border transition-smooth cursor-pointer hover-lift ${
                        selectedPlayer?.name === player.name 
                          ? "border-primary bg-primary/5 shadow-glow" 
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                       onClick={() => {
                         setSelectedPlayer(player);
                         setShowAllPlayers(false);
                       }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{player.name}</span>
                        <div className="flex items-center gap-1">
                          {player.totalEarnings >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-danger" />
                          )}
                          <span className={`text-sm font-semibold ${
                            player.totalEarnings >= 0 ? 'text-success' : 'text-danger'
                          }`}>
                            R{player.totalEarnings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player Performance */}
          <Card className="lg:col-span-2 shadow-elegant">
            <CardHeader className="bg-gradient-success rounded-t-lg">
              <CardTitle className="text-success-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {showAllPlayers ? "All Players Performance" : selectedPlayer ? `${selectedPlayer.name}'s Performance` : "Select a Player"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {showAllPlayers ? (
                <div className="space-y-6">
                  {players.length > 0 && players.some(p => p.earnings.length > 0) ? (
                    <div className="chart-container">
                      <h3 className="font-semibold mb-4">Cumulative Earnings Comparison</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={generateAllPlayersData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="match" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)"
                            }}
                          />
                          <Legend />
                          {players.map((player, idx) => (
                            <Line 
                              key={player.name}
                              type="monotone" 
                              dataKey={player.name} 
                              stroke={playerColors[idx % playerColors.length]} 
                              strokeWidth={3}
                              dot={{ fill: playerColors[idx % playerColors.length], strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: playerColors[idx % playerColors.length], strokeWidth: 2 }}
                              name={`${player.name} (R)`}
                              connectNulls={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="chart-container text-center py-12">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No earnings data available. Add players and earnings to see the comparison chart!</p>
                    </div>
                  )}
                </div>
              ) : selectedPlayer ? (
                <div className="space-y-6">
                  {/* Add Earning Section */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter earning amount (negative for losses)"
                      value={newEarning}
                      onChange={(e) => setNewEarning(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddEarning()}
                      type="number"
                      step="0.01"
                      className="flex-1"
                    />
                    <Button onClick={handleAddEarning} variant="success">
                      Add Earning
                    </Button>
                  </div>

                  {/* Performance Chart */}
                  {selectedPlayer.earnings.length > 0 ? (
                    <div className="chart-container">
                      <h3 className="font-semibold mb-4">Cumulative Earnings Over Time</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={selectedPlayer.earnings}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="match" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)"
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="total" 
                            stroke="hsl(var(--success))" 
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "hsl(var(--success))", strokeWidth: 2 }}
                            name="Total Earnings (R)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="chart-container text-center py-12">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No earnings recorded yet. Add an earning above to see the chart!</p>
                    </div>
                  )}

                  {/* Earnings History */}
                  {selectedPlayer.earnings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">Recent Earnings</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedPlayer.earnings.slice().reverse().map((earning, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                              <span className="font-medium">{earning.match}</span>
                              <span className="text-sm text-muted-foreground ml-2">({earning.date})</span>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${earning.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                                {earning.amount >= 0 ? '+' : ''}R{earning.amount}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total: R{earning.total}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">
                    Select a player from the left panel to view their performance analytics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}