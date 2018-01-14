# TaskMastr: Event Resource Management System

## What is this:
This code repository represents the back end of the TaskMastr system. TaskMastr hopes to serve as a **free and opensource** tool for basic volunteer and material management. 

## Technologies involved:
- TaskMastr is powered by Node.js, allowing from easy socket handling and non-blocking I/O, with the ability to later integrate additional asynchrenous features. (With Luck, we might even have to start optimizing with C++)
- MongoDB is used to store models of the Events for the purposes of long-term material and password information storage
- TypeScript is used to enhance developer productivity and provide more thorough protection against errors
- Testing is executed with the Mocha and Chai libraries
- Automation with Gulp

## Orders of business
### Thus far, the following have been finished:
- The creation of participant, task, and material models
- A rough prototype of Event object
- Layout of the overall system
- EventManager and testing
- DB controller implementation and testing
### Yet to be done:
- Create connecting class between EventManager and the DB controller
- Implement request validation and sanitization
- Handle actual server requests and socket actions

### Currently floating ideas:
 - Control/create views to be sent to front-end client based on the type of user
    - adds significant security and simplifies the action while on only large-screen devices,
    but adds additional complications when it comes to stylizing for something like cordova or react native, where the view and code may have to be adapted for a mobile platform

- Trying a framework other than Express
    - Express has proven reliable and easy to use, but has some tedium involved that could potentially be cut by Hapi.js or by Meteor, if the above idea is realized. Additionally, Koa could be interesting to try as it has been benchmarked as having somewhat higher request handling speeds.
