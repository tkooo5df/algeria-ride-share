import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { wilayas } from "@/data/wilayas";

const SearchForm = () => {
  const navigate = useNavigate();
  const [pickupWilaya, setPickupWilaya] = useState("");
  const [destinationWilaya, setDestinationWilaya] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Get wilaya names from codes
    const pickupName = wilayas.find(w => w.code === pickupWilaya)?.name || pickupWilaya;
    const destinationName = wilayas.find(w => w.code === destinationWilaya)?.name || destinationWilaya;
    
    navigate(`/ride-search?pickup=${encodeURIComponent(pickupName)}&destination=${encodeURIComponent(destinationName)}&date=${date}`);
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">ابحث عن رحلة</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">من</Label>
                  <Select value={pickupWilaya} onValueChange={setPickupWilaya}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.code}>
                          {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">الى</Label>
                  <Select value={destinationWilaya} onValueChange={setDestinationWilaya}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.code}>
                          {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passengers">عدد الركاب</Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} راكب{num > 1 ? 'ين' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button type="submit" className="w-full">ابحث الآن</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SearchForm;