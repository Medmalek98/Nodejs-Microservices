const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const Eureka = require('eureka-js-client').Eureka;

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
      email: 'johndsoe@example.com',
      phone: '123-456-7890',
      hireDate: '2022-01-01',
      salary: 50000
    });
  
    await Employee.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janesdoe@example.com',
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
const eureka = new Eureka({  instance: {
        app: 'employee-service',
        instanceId: 'NodeJS-employee-service',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: {
            '$': 3000,
            '@enabled': 'true',
        },
        vipAddress: 'employee-service',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
        registerWithEureka: true,
        fetchRegistry: true,
    },
    eureka: {
        host: 'localhost',
        port: 8761,
        servicePath: '/eureka/apps/',

    },});

Promise.all([sequelize.sync(), new Promise((resolve, reject) => {
    eureka.start((error) => {
        if (error) {
            reject(error);
        } else {
            console.log('Eureka client started');
            resolve();
        }
    });
})])
    .then(() => {
        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    })
    .catch((error) => {
        console.log(error);
    });
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Stopping server and Eureka client.');

    // stop the Eureka client
    eureka.stop(() => {
        console.log('Eureka client stopped.');
        process.exit(0);
    });


});

// handle the SIGINT signal
process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Stopping server and Eureka client.');

    // stop the Eureka client
    eureka.stop(() => {
        console.log('Eureka client stopped.');
        process.exit(0);
    });

    // stop the server

});