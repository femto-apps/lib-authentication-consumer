# Authentication Consumer Middleware Library
## Description
Library code for an authentication consumer. This library is to be imported in to an euthentication consumer program. 

## Usage
This library is designed to be incorported in to an authentication consumer. A usage example is given below. 
```
app.use(authenticationConsumer({ options }))
```
`options` is an object with three parts: 
- `tokenService: { endpoint }` - The hostname of the token service to use. 
- `authenticationProvider: { endpoint, consumerId }` - The hostname of the provider to use and the consumer uuid used by the provider to identify the consumer. 
- `authenticationConsumer: { endpoint }` - The hostname of the consumer. 
