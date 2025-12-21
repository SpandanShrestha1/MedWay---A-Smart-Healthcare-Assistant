import { Label } from "../ui/label";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

export const PharmacyCard = ({
  pharmacyInfo,
  handleDeletePharmacy,
  handleEditPharmacy,
}) => {
  return (
    <Card className={"cursor-pointer border-[4px] border-black"}>
      <CardContent>
        <Label>Pharmacy Name: {pharmacyInfo?.pharmacyName}</Label>
        <Label>Address: {pharmacyInfo?.address}</Label>
        <Label>License Number: {pharmacyInfo?.licenseNumber}</Label>
        <Label>Contact Number: {pharmacyInfo?.contactNumber}</Label>
        <Label>
          Delivery Available: {pharmacyInfo?.deliveryAvailable ? "Yes" : "No"}
        </Label>
      </CardContent>
      <CardFooter className="p-3 flex justify-betweeen">
        <Button onClick={() => handleEditPharmacy(pharmacyInfo)}>Edit</Button>
        <Button onClick={() => handleDeletePharmacy(pharmacyInfo)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
