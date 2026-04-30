import { Request, Response } from 'express';
import Task from './task.model';
import mongoose from 'mongoose';
import User from '../user/user.model';

type Params = {
  id: string;
};

/*
============== CREATE TASK - CONTROLLER =============
---- FLOW ----
1. Accept task data
2. Validate input
3. Attach logged-in user (owner)
4. Save task
5. Return safe response
*/
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      title,
      description,
      priority,
      status,
      dueDate,
      tags,
      assignedTo,
      collaborators = [],
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      tags,
      owner: userId,
      assignedTo,
      collaborators,
    });

    return res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error: any) {
    console.error('Create task error:', error.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== GET TASKS - CONTROLLER =============
---- FLOW ----
1. TAKE QUERY - REQ.QUERY
2. GET TASK - WITH REQ.USER.USERID
3. VALIDATE USERID
4. APPLY FILTERING AND PAGINATION
5. RETURN SAGE RESPONSE
*/
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const {
      status,
      priority,
      search,
      sort = '-createdAt',
      page = '1',
      limit = '10',
      startDate,
      endDate,
    } = req.query;

    // 🔐 ACCESS FILTER (COLLABORATION)
    const filter: any = {
      isDeleted: false,
      $or: [
        { owner: userId },
        { assignedTo: userId },
        { collaborators: userId },
      ],
    };

    // 🔹 MULTI STATUS
    if (status) {
      filter.status = { $in: (status as string).split(',') };
    }

    // 🔹 MULTI PRIORITY
    if (priority) {
      filter.priority = { $in: (priority as string).split(',') };
    }

    // 🔍 SEARCH
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search as string, $options: 'i' } },
          { description: { $regex: search as string, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ],
      });
    }

    // 📅 DATE RANGE
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    // 🔹 PAGINATION
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = Math.min(parseInt(limit as string, 10) || 10, 50);

    const skip = (pageNumber - 1) * limitNumber;

    // 🔹 QUERY
    const tasks = await Task.find(filter)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await Task.countDocuments(filter);

    return res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      tasks,
    });
  } catch (error: any) {
    console.error('Get tasks error:', error.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== GET TASK BY ID - CONTROLLER =============
---- FLOW ----
1. AUTH CHECK
2. VALIDATE OBJECT ID
3. FIND TASK WITH OWNERSHIP
4. NOT FOUND
5. RETURN SAGE RESPONSE
*/
export const getTask = async (req: Request<Params>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 🔹 VALIDATE ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    // 🔐 ACCESS FILTER
    const task = await Task.findOne({
      _id: id,
      isDeleted: false,
      $or: [
        { owner: userId },
        { assignedTo: userId },
        { collaborators: userId },
      ],
    }).lean();

    if (!task) {
      return res.status(404).json({
        message: 'Task not found or access denied',
      });
    }

    return res.status(200).json({
      task,
    });
  } catch (error: any) {
    console.error('Get task error:', error.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== UPDATE TASK - CONTROLLER =============
---- FLOW ----
1. Validate user (auth)
2. Validate task ID
3. Ensure task belongs to user
4. Allow partial updates
5. Validate allowed fields
6. Update task
7. Return updated task
*/
export const updateTask = async (req: Request<Params>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const task = await Task.findById(id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 🔐 ACCESS CONTROL
    const isOwner = task.owner.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;

    if (!isOwner && !isAssigned) {
      return res.status(403).json({
        message: 'Not allowed to update this task',
      });
    }

    // 🔹 ALLOWED FIELDS
    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'tags',
    ];

    const updates: any = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error: any) {
    console.error('Update task error:', error.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== DELETE TASK - CONTROLLER =============
---- FLOW ----
1. Validate user
2. Validate task ID
3. Ensure ownership
4. Soft delete (isDeleted = true)
5. Return success response
*/
export const deleteTask = async (req: Request<Params>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const task = await Task.findById(id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 🔐 ONLY OWNER
    if (task.owner.toString() !== userId) {
      return res.status(403).json({
        message: 'Only owner can delete this task',
      });
    }

    task.isDeleted = true;
    task.deletedAt = new Date();

    await task.save();

    return res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete task error:', error.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== ASSIGN TASK - CONTROLLER =============
---- FLOW ----
1. Only owner can assign
2. Validate user exists
3. Update assignedTo
*/
export const assignTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { assignedTo } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // ONLY OWNER CAN ASSIGN
    if (task.owner.toString() !== userId) {
      return res.status(403).json({
        message: 'Only owner can assign task',
      });
    }

    task.assignedTo = assignedTo;
    await task.save();

    return res.status(200).json({
      message: 'Task assigned successfully',
      task,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== COLLABROATOR TASK - CONTROLLER =============
---- FLOW ----
1. Only owner can modify collaborators
2. Add OR remove collaborators
3. Prevent duplicates
4. Validate users exist
5. Prevent owner being added as collaborator
6. Return updated task
*/
export const updateCollaborators = async (
  req: Request<Params>,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { add = [], remove = [] } = req.body;

    // 1. AUTH CHECK
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 2. VALIDATE TASK ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    // 3. FIND TASK
    const task = await Task.findById(id);

    if (!task || task.isDeleted) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    // 4. ONLY OWNER CAN MODIFY
    if (task.owner.toString() !== userId) {
      return res.status(403).json({
        message: 'Only owner can update collaborators',
      });
    }

    // 5. VALIDATE USERS EXIST
    const allUserIds = [...add, ...remove];

    if (allUserIds.length > 0) {
      const users = await User.find({
        _id: { $in: allUserIds },
      });

      if (users.length !== allUserIds.length) {
        return res.status(400).json({
          message: 'One or more users not found',
        });
      }
    }

    // 6. PREVENT OWNER IN COLLABORATORS
    const filteredAdd = add.filter(
      (uid: string) => uid !== task.owner.toString(),
    );

    // 7. UPDATE COLLABORATORS
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          collaborators: { $each: filteredAdd },
        },
        $pull: {
          collaborators: { $in: remove },
        },
      },
      { new: true },
    );

    // 8. RESPONSE
    return res.status(200).json({
      message: 'Collaborators updated successfully',
      task: updatedTask,
    });
  } catch (err: any) {
    console.error('Update collaborators error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};