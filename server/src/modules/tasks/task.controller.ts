import { Request, Response } from 'express';
import Task from './task.model';
import mongoose from 'mongoose';

type Params =  {
  id: string;
}

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
    // 1. Accept task data
    const { title, description, priority, dueDate, tags } = req.body;

    // 2. Validate input
    if (!title) {
      return res.status(400).json({
        message: 'Title is required',
      });
    }

    // 3. Attach logged-in user (owner)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 4 CREATE TASK
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      tags,
      userId, // 🔐 secure ownership
    });

    // 4. SAFE RESPONSE
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        tags: task.tags,
        createdAt: task.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Create task error:', err.message);

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

    // QUERY PARAMS
    const {
      status,
      priority,
      search,
      sort = '-createdAt',
      page = '10',
      limit = '10',
    } = req.query;

    // 🔹 BUILD FILTER OBJECT
    const filter: any = {
      userId,
      isDelete: false,
    };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    // 🔍 SEARCH (title + description)
    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    // 🔹 PAGINATION
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;

    const skip = (pageNumber - 1) * limitNumber;

    // 🔹 EXECUTE QUERY
    const tasks = await Task.find(filter)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNumber);

    // 🔹 TOTAL COUNT (for frontend pagination)
    const total = await Task.countDocuments(filter);

    // 🔹 RESPONSE
    return res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      tasks,
    });
  } catch (err: any) {
    console.error('Get task error:', err.message);

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
    const id = req.params.id;

    // 1. AUTH CHECK
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 2. VALIDATE OBJECT ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    // FIND TASK WITH OWNERSHIP
    const task = await Task.findOne({
      _id: id,
      userId,
      isDelete: false,
    });

    // 4. NOT FOUND
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    // 5. RESPONSE
    return res.status(200).json({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('Get task error:', err.message);

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
    const id = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // VALIDATE TASK ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    // 2. FILTER ALLOWED FIELDS
    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'tags',
      'assignedTo',
    ];

    const updates: any = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // 3. FIND & UPDATE
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        userId,
        isDeleted: false,
      },
      updates,
      {
        new: true, // return updated Document
        runValidators: true, // enforce schema validation
      },
    );

    // 4. NOT FOUND
    if (!task) {
      return res.status(404).json({
        message: 'Task not found or unauthorized',
      });
    }

    // 5. RESPONSE
    return res.status(200).json({
      message: 'Task updated successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('Update task error:', err.message);

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

    // 1. AUTH CHECK
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 2. VALIDATE ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task ID',
      });
    }

    // 3. FIND AND SOFT-DELETE
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      {
        new: true,
      },
    );

    // 4. NOT FOUND
    if (!task) {
      return res.status(404).json({
        message: 'Task not found or already deleted',
      });
    }

    // 5. RESPONSE
    return res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete task error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};