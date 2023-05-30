const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const Eureka = require('eureka-js-client').Eureka;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
const sequelize = new Sequelize('mysql://root:root@mysqlservice:3306/database', {
    dialectOptions: {
        connectTimeout: 30000},
    retry: {
        max: 10
    }
});
const eurekaHost = (process.env.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE || 'eurekaserver');
const eurekaPort = 8761;
const hostName = (process.env.HOSTNAME || 'eurekaserver')
const ipAddr = 'eurekaserver';
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
app.post('/apinode/employees', async (req, res) => {
    try {
      const employee = await Employee.create(req.body);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get('/apinode/employees', async (req, res) => {
    try {
      const employees = await Employee.findAll();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/apinode/employees/:id', async (req, res) => {
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
  
  app.put('/apinode/employees/:id', async (req, res) => {
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
app.delete('/apinode/employees/:id', async (req, res) => {
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
        hostName: hostName,
        ipAddr: ipAddr,
        port: {
            '$': PORT,
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
        host: eurekaHost,
        port: eurekaPort ,
        servicePath: '/eureka/apps/',
        maxRetries: 200, // Number of retries
        requestRetryDelay: 20, // Interval between retries in milliseconds
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
    eureka.stop(() => {
        console.log('Eureka client stopped.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Stopping server and Eureka client.');
    eureka.stop(() => {
        console.log('Eureka client stopped.');
        process.exit(0);
    });
});
