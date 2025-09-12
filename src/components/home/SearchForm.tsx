import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/ride-search?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`);
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
                  <Input 
                    id="pickup" 
                    placeholder="أدخل موقع الانطلاق"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">الى</Label>
                  <Input 
                    id="destination" 
                    placeholder="أدخل وجهتك"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
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