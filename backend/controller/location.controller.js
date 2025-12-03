const Location = require("../models/location.model");

// CREATE LOCATION
exports.createLocation = async (req, res) => {
    try {
        const { name, address } = req.body;
        if (!name || !address) {
            return res.status(400).json({ message: "Name and address are required" });
        }
        const newLocation = new Location({ name, address });
        const savedLocation = await newLocation.save();
        res.status(201).json({ message: "Location created", location: savedLocation });
    } catch (error) {
        console.error("Error creating location:", error);
        res.status(500).json({ message: "Server error" });
    }   
};

exports.getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json({ locations });
    }   catch (error) {     
        console.error("Error fetching locations:", error);
        res.status(500).json({ message: "Server error" });
    }

}

exports.updateLocation = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = { ...req.body };
        const updatedLocation = await Location.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedLocation) {
            return res.status(404).json({ message: "Location not found" });
        }       res.status(200).json({ message: "Location updated", location: updatedLocation });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ message: "Server error" });
    }       


}
exports.deleteLocation = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedLocation = await Location.findByIdAndDelete(id);
        if (!deletedLocation) {
            return res.status(404).json({ message: "Location not found" });
        }
        res.status(200).json({ message: "Location deleted" });
    } catch (error) {
        console.error("Error deleting location:", error);
        res.status(500).json({ message: "Server error" });
    }
};

