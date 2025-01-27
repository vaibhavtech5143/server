export const assignVendor = async (req, res) => {
    try {
      const { vendorId, status } = req.body;
      if (!vendorId) {
        return res.status(400).json({ message: 'Vendor ID is required.' });
      }
  
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }
  
      task.vendor = vendorId;
      task.status = status || 'assigned'; // Default status if not provided
      await task.save();
  
      res.status(200).json({
        status: 'success',
        data: {
          task
        }
      });
    } catch (err) {
      res.status(500).json({
        status: 'fail',
        message: err.message
      });
    }
  };
  