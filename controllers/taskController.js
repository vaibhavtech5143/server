    import Task from '../models/Task.js';
    import Vendor from '../models/Vendors.js';
    import User from '../models/User.js'; // Assuming the User model is imported correctly
    import Supervisor from '../models/Supervisors.js'; 


    // Used By Only Supervisor For Assigning Task and updating status of the task that is assigned/approved/ rejected
    export const assignVendor = async (req, res) => {
      try {
        const { vendorId, action } = req.body;
        const supervisorId = req.user.id; // Logged-in supervisor's ID
    
        // Validate required fields
        if (!action) {
          return res.status(400).json({ message: 'Action is required.' });
        }
    
        const task = await Task.findById(req.params.id).populate('supervisor vendor');
        if (!task) {
          return res.status(404).json({ message: 'Task not found.' });
        }
    
        // Restrict task modification to the supervisor who assigned it
        if (task.supervisor && task.supervisor._id.toString() !== supervisorId) {
          return res.status(403).json({ message: 'You are not authorized to modify this task.' });
        }
    
        // Validate supervisor existence
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
          return res.status(404).json({ message: 'Supervisor not found.' });
        }
    
        switch (action.toLowerCase()) {
          case 'assign': {
            // Validate vendor
            if (!vendorId) {
              return res.status(400).json({ message: 'Vendor ID is required for assignment.' });
            }
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) {
              return res.status(404).json({ message: 'Vendor not found.' });
            }
    
            // Assign vendor and update task details
            task.vendor = vendorId;
            task.supervisor = supervisorId;
            task.status = 'assigned';
    
            // Update supervisor's and vendor's task lists
            supervisor.assignedTasks.push(task._id);
            vendor.activeTasks.push(task._id);
    
            await Promise.all([task.save(), supervisor.save(), vendor.save()]);
    
            return res.status(200).json({
              status: 'success',
              message: 'Task assigned successfully.',
              data: { task },
            });
          }
    
          case 'approve': {
            task.status = 'approved';
    
            // Update supervisor's assigned and approved task lists
            supervisor.assignedTasks = supervisor.assignedTasks.filter(
              (taskId) => taskId.toString() !== task._id.toString()
            );
            supervisor.approvedTasks.push(task._id);
    
            // Update vendor's active and completed task lists
            if (task.vendor) {
              const vendor = await Vendor.findById(task.vendor);
              if (vendor) {
                vendor.activeTasks = vendor.activeTasks.filter(
                  (taskId) => taskId.toString() !== task._id.toString()
                );
                vendor.completedTasks.push(task._id);
                await vendor.save();
              }
            }
    
            // Add task to user's work history

           
            
            if (task.vendor) {
              const user = await User.findById(task.resident);
              
              
              if (user && !user.repairHistory.includes(task._id)) {
                user.repairHistory.push(task._id);
                await user.save();
              }
            }
    
            await Promise.all([task.save(), supervisor.save()]);
    
            return res.status(200).json({
              status: 'success',
              message: 'Task approved successfully and added to work history.',
              data: { task },
            });
          }
    
          case 'reject': {
            task.status = 'rejected';
    
            // Update supervisor's assigned and rejected task lists
            supervisor.assignedTasks = supervisor.assignedTasks.filter(
              (taskId) => taskId.toString() !== task._id.toString()
            );
            supervisor.rejectedTasks.push(task._id);
    
            // Update vendor's active and rejected task lists
            if (task.vendor) {
              const vendor = await Vendor.findById(task.vendor);
              if (vendor) {
                vendor.activeTasks = vendor.activeTasks.filter(
                  (taskId) => taskId.toString() !== task._id.toString()
                );
                vendor.rejectedTasks.push(task._id);
                await vendor.save();
              }
            }
    
            await Promise.all([task.save(), supervisor.save()]);
    
            return res.status(200).json({
              status: 'success',
              message: 'Task rejected successfully.',
              data: { task },
            });
          }
    
          default:
            return res.status(400).json({
              status: 'fail',
              message: 'Invalid action. Use "assign", "approve", or "reject".',
            });
        }
      } catch (err) {
        return res.status(500).json({
          status: 'fail',
          message: err.message,
        });
      }
    };
    

// Used By Only Resident or User  For Creating  Task
export const createTask = async (req, res) => {
  try {
    const newTask = await Task.create({
      ...req.body,
      resident: req.user.id, // The resident who created the task
      supervisor: null// Supervisor assigned to the task
    });

    res.status(201).json({
      status: 'success',
      data: {
        task: newTask
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Used By Supervisor to get tasks

export const getTasks = async (req, res) => {
  try {
    let query = {};

   
    const tasks = await Task.find(query)
      .populate({
        path: 'resident',
        select: '-password', // Exclude the password field
      })
      .populate({
        path: 'vendor',
        select: '-password', // Exclude the password field (if vendor has a password)
      })
      .populate({
        path: 'supervisor',
        select: '-password', // Exclude the password field
      })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};


export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    .populate({
      path: 'resident',
      select: '-password', // Exclude the password field
    })
    .populate({
      path: 'vendor',
      select: '-password', // Exclude the password field (if vendor has a password)
    })
    .populate({
      path: 'supervisor',
      select: '-password', // Exclude the password field
    })
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};



// can change currentDeadline , assignedDate , Vendor
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Allow only supervisors to update specific fields
    const allowedUpdatesForSupervisor = ['currentDeadline', 'assignedDate', 'vendor'];

    const restrictedFields = Object.keys(updates).filter(field => !allowedUpdatesForSupervisor.includes(field));

    if (restrictedFields.length > 0) {
      return res.status(403).json({ message: `Supervisors can only update: ${allowedUpdatesForSupervisor.join(', ')}` });
    }

    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/////  used by vendor
export const addProgress = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }

    task.progress.push({
      description: req.body.description,
      status: req.body.status
    });

    await task.save();

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};



export const 

//can be used by resident or user only
export const addRating = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }

    if (task.resident.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only rate tasks that you created'
      });
    }

    task.rating = {
      score: req.body.score,
      comment: req.body.comment,
      date: new Date()
    };

    await task.save();

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};  


