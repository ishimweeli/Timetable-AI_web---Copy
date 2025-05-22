
## Guidelines:
- Don't put comments or documentary in the codebases.
- Use variables names which start with their objects.
- Use final keyword on all variables which are not changing.
- Naming convection:
    * classes: TypeModuleAction
      Example:
      ControllerAuthLogin : Type is Controller, Module is Auth, Action is Login
      FilterRoomSecurityAdmin : Type is Filter, Module is Room, Action is SecurityAdmin
      RepositoryUser : Type is Repository, Module is User, Action is - (generic)

Order to follow in Repository, Service, Impl, Controller when creating methods:
[GET] Get Single
[GET] Get Single by filter(s)
[GET] Get All
[GET] Get All by filter(s)
[GET] ... etc
[POST] Create
[POST] ... etc
[PUT] Update Single
[PUT] Update All or by Filter(s)
[PUT] ... etc
[DELETE] Delete Single
[DELETE] Delete All or By Filter(s)
[DELETE] ... etc
