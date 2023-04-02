const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(bodyParser.json());
const sequelize = new Sequelize('mysql://root:root@localhost:3306/database');

const Employee = sequelize.define('Employee', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  });
  sequelize.sync()
  .then(async () => {
    console.log('Employee model synced with the database.');
    await Employee.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      phone: '123-456-7890',
      hireDate: '2022-01-01',
      salary: 50000
    });
  
    await Employee.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@example.com',
      phone: '234-567-8901',
      hireDate: '2022-02-01',
      salary: 60000
    });
  
  })
  .catch((error) => {
    console.error('Unable to sync Employee model with the database:', error);
  });
// Create a new employee
app.post('/employees', async (req, res) => {
    try {
      const employee = await Employee.create(req.body);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Read all employees
  app.get('/employees', async (req, res) => {
    try {
      const employees = await Employee.findAll();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Read one employee
  app.get('/employees/:id', async (req, res) => {
    try {
      const employee = await Employee.findByPk(req.params.id);
      if (employee) {
        res.json(employee);
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update an employee
  app.put('/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (employee) {
          await employee.update(req.body);
          res.json(employee);
        } else {
          res.status(404).json({ message: 'Employee not found' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating employee' });
      }
    });
    // DELETE operation
app.delete('/employees/:id', async (req, res) => {
    try {
      const employee = await Employee.findByPk(req.params.id);
      if (employee) {
        await employee.destroy();
        res.json({ message: 'Employee deleted successfully' });
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error deleting employee' });
    }
  });
  
  sequelize.sync().then(() => {
    app.listen(3000, () => {
      console.log('Server started on port 3000');
    });
  }).catch((error) => {
    console.log(error);
  });
  