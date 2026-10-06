# TypeScript Code Style

## Naming and types

Use kebab-case filenames, PascalCase classes and types, and camelCase functions and variables. Use consistent domain terminology.

Prefix interfaces with I, such as IUserAdapter. Prefix generic parameters with T, such as Between<TMin, TMax>; this does not require prefixing the type alias itself.

Use type aliases by default, including for object shapes. Interfaces are only for class contracts. When multiple implementations are required, such as adapters or plugins, define an interface and require every implementation to declare implements. Do not introduce interfaces for a lone class without a real alternative-implementation requirement.

Infer function and method return types, including exported functions. Do not add explicit return annotations. Infer obvious local values; use other annotations where they clarify contracts or prevent widening.

Prefer specific object shapes and discriminated unions. Use unions instead of enums, and objects with as const for runtime constants.

Use generics for real type relationships. Avoid unreadable utility-type composition and speculative generic abstractions.

## Type safety and absence

Non-null assertions are prohibited; logical negation remains allowed.

Prefer unknown and safe narrowing for untrusted values. Validate external input at meaningful boundaries, not repeatedly between trusted internal modules.

Any and type assertions, including double assertions, require explicit user approval and are allowed only when no safe practical alternative exists. Prefer correcting contracts or narrowing. Const assertions such as as const are permitted because they do not bypass safety.

Use null for explicitly assigned or returned absence. Do not deliberately assign or return undefined as an absence sentinel. Account for undefined when the language or external APIs naturally produce it.

Make properties optional only when genuinely optional. Do not use optional chaining or fallbacks to hide broken invariants. Use ?? rather than || when valid falsy values must be retained.

## Functions and classes

Prefer arrow functions and simple composition or currying. Avoid heavy functional-programming abstractions and unreadable pipelines.

Use classes mainly for data structures, or when organization, state, lifecycle, or framework requirements provide a concrete benefit. Do not use classes merely to collect stateless functions.

Do not write access modifiers on ordinary members. Use # private fields and methods. Constructor parameter properties are allowed, including their required modifiers; for private state, declare # fields separately and initialize them in the constructor.

Group static members, instance fields, constructors, accessors, and methods coherently.

Keep functions cohesive and control flow clear. Prefer guard clauses when useful. Avoid behavior-switching boolean parameters. Use object parameters when they represent meaningful groups.

Do not mutate inputs unexpectedly. Local mutation is acceptable when clearer; do not clone reflexively. Use readonly for meaningful contracts, not mechanically.

Use collection methods when natural and loops when clearer. Do not force reduce or functional chains.

## Async code and errors

Prefer async/await where clearer. Avoid unnecessary async functions, manual promises, and Promise.resolve wrappers. Use return await only for a concrete reason such as local error handling or cleanup.

Make sequencing and concurrency deliberate. Run independent operations concurrently when appropriate; do not use Promise.all when partial failure or ordering needs different handling.

Catch only where recovery, translation, cleanup, or useful context is possible. Narrow caught unknown values. Do not swallow errors, add speculative fallbacks, or create error classes without meaningful semantics.

## Readability

Separate meaningful stages and member groups with blank lines. Keep tightly related declarations together.

Follow global comment rules. Use JSDoc only for useful constraints or behavior not expressed by names and types. Do not replace readable structure with ceremonial section comments.

## Detailed engineering guidance

## General

Write idiomatic TypeScript.

Use the type system to make code easier to understand and harder to misuse.

Prefer explicit domain models over loosely typed objects.

Do not use TypeScript only as annotated JavaScript. Use its type system where it improves correctness and readability.

Avoid unnecessary type-level complexity.

A simpler type that is easy to understand is usually better than a clever generic abstraction.

## Naming

Use names that describe intent.

Prefer domain terminology over generic technical terminology.

Use the same term for the same concept throughout the codebase.

Avoid vague names when a specific name is available.

Short or generic names are acceptable when their meaning is clear from the local context.

Avoid redundant names that repeat information already obvious from the surrounding context.

Use common TypeScript naming conventions consistently with the project.

## Visual structure

Whitespace is part of code readability.

Use blank lines to separate distinct logical blocks.

A reader should be able to understand the rough structure of a function, method, or class by scanning it vertically.

Separate declarations and initial preparation from subsequent control flow.

Separate guards from the main operation.

Separate loops and conditions from unrelated setup or post-processing.

Separate data preparation from side effects when they represent different stages.

Separate side effects from result construction when doing so improves readability.

Prefer:

```ts
const user = await userService.getUser(userId);
const permissions = await permissionService.getPermissions(userId);

if (!user) {
  return null;
}

const profile = createProfile(user);
const access = resolveAccess(permissions);

return {
  profile,
  access,
};
```

over:

```ts
const user = await userService.getUser(userId);
const permissions = await permissionService.getPermissions(userId);
if (!user) {
  return null;
}
const profile = createProfile(user);
const access = resolveAccess(permissions);
return {
  profile,
  access,
};
```

Keep tightly related declarations together.

Do not insert blank lines between every statement.

A blank line should represent a logical boundary.

Different stages should look different when scanning the code.

Do not remove meaningful blank lines merely to make code visually shorter.

Do not replace useful whitespace with comments such as:

```ts
// Validation
// Processing
// Result
```

when naming and structure already communicate those stages.

## Functions and methods

Prefer clear, cohesive functions.

Functions should have one understandable purpose, but do not interpret that as a requirement to make every function tiny.

Avoid deeply nested control flow.

Prefer guard clauses where they make the main path clearer.

Do not split cohesive logic into many tiny functions merely to satisfy a style rule.

Extract a function when the extracted operation has a meaningful name or responsibility.

Do not extract code only to reduce line count.

Avoid hidden side effects.

Do not mutate function inputs unless mutation is intentional, expected, and clearer than copying.

Prefer one abstraction level within a function when practical.

When a function contains several distinct stages, separate them with blank lines.

For example:

```ts
const createOrder = async (command: CreateOrderCommand) => {
  const customer = await customerRepository.get(command.customerId);
  const products = await productRepository.getMany(command.productIds);

  if (products.length === 0) {
    throw new EmptyOrderError();
  }

  const order = buildOrder(customer, products);

  await orderRepository.save(order);

  return order;
};
```

Do not write multi-stage functions as uninterrupted walls of statements.

Blank lines should expose structure without requiring explanatory comments.

## Classes

Use classes when they provide meaningful:

- state ownership;
- lifecycle;
- polymorphism;
- framework integration;
- domain behavior.

Do not create a class merely to group stateless functions.

Prefer plain functions or modules when no persistent object state or class-specific behavior is needed.

Keep classes cohesive.

Do not let service classes become dumping grounds for unrelated operations.

Do not split a cohesive class into many tiny classes merely to satisfy a pattern.

## Class structure

Keep classes visually organized.

Group related members together.

A typical class should usually follow a structure similar to:

```text
static constants

static fields

instance fields

constructor

getters / setters

ordinary methods

# private methods
```

Adapt the exact order when another arrangement better fits the class or project conventions.

Separate distinct member groups with blank lines.

Separate methods visually.

Do not interleave fields, constructors, accessors, ordinary methods, and # private helpers without a reason.

Prefer:

```ts
class UserService {
  #repository: UserRepository;
  #logger: Logger;

  constructor(repository: UserRepository, logger: Logger) {
    this.#repository = repository;
    this.#logger = logger;
  }

  async getUser(id: UserId) {
    return this.#repository.findById(id);
  }

  async updateUser(
    id: UserId,
    input: UpdateUserInput,
  ) {
    const user = await this.#getRequiredUser(id);

    const updatedUser = applyUserUpdate(user, input);

    await this.#repository.save(updatedUser);

    return updatedUser;
  }

  async #getRequiredUser(id: UserId) {
    const user = await this.#repository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }
}
```

Do not collapse class members or multi-stage method bodies into dense uninterrupted blocks.

If a class becomes difficult to navigate even with clear grouping, review whether it has accumulated too many responsibilities.

## Types and interfaces

Use type aliases by default for object shapes, unions, intersections, mapped types, conditional types, aliases, composed types, and function signatures.

Use interfaces only to describe class contracts. If multiple adapters, plugins, or other classes must implement the same contract, define an I-prefixed interface and require each class to declare implements explicitly.

Do not create one-to-one interface and implementation pairs for a single class without a real need for alternate implementations. Do not invent speculative implementations to justify an interface.

## Strict typing

Prefer strict typing.

Avoid `any`.

Use `unknown` when a value is genuinely unknown and must be validated or narrowed before use.

Do not replace a type error with `as any`.

Do not use broad type assertions merely to silence the compiler.

Type assertions should express knowledge that TypeScript cannot infer, not bypass type safety.

Prefer narrowing over casting.

Use runtime validation at external boundaries when TypeScript types cannot guarantee the shape of incoming data.

Examples include:

- HTTP input;
- third-party APIs;
- storage;
- user input;
- deserialized data;
- messages from external systems.

Do not add runtime validation between internal modules when the type system already establishes the contract and there is no untrusted boundary.

Any and type assertions are permitted only when no safe practical alternative exists and after explicit user approval. Safe const assertions are allowed.

## Inference

Let TypeScript infer types when the inferred type is clear and stable.

Do not annotate obvious local variables unnecessarily.

Prefer:

```ts
const users = getUsers();
```

over:

```ts
const users: User[] = getUsers();
```

when the inferred type is already clear and useful.

Add non-return type annotations where they improve API clarity, protect a boundary, or prevent accidental widening.

Do not annotate function return types, including public functions. Let TypeScript infer them.

## Object shapes

Prefer specific object types over generic containers.

Avoid structures such as:

```ts
Record<string, any>
Record<string, unknown>
object
{}
```

when the actual shape is known.

Use `Record` when the domain genuinely represents a key-value mapping.

Do not use index signatures merely because defining the real structure takes more work.

## Unions and enums

Prefer union types for closed sets of values:

```ts
type Status = 'idle' | 'loading' | 'success' | 'error';
```

Use typed constant objects with as const for shared runtime values. Do not introduce enums automatically.

## Null and undefined

Use null for explicitly assigned or returned absence. Handle undefined when the language or external APIs naturally produce it; do not assign or return it deliberately.

Do not mix them arbitrarily for the same semantic meaning.

Prefer one representation of absence within a given API.

Do not add optional properties simply to avoid constructing a complete object.

Use optional properties only when the property is genuinely optional.

Non-null assertions are prohibited, even when an invariant is known. Use proper narrowing or restructure the code.

Avoid:

```ts
value!
```

without exceptions. This prohibition does not apply to logical negation.

## Parameters

Prefer explicit parameters for small, clear argument lists.

Use an object parameter when arguments form a meaningful group, there are many optional arguments, or call-site readability improves.

Avoid boolean parameters that substantially change behavior.

Instead of:

```ts
loadUser(true);
```

prefer an explicit API when the distinction is meaningful.

Do not turn every parameter list into an options object without a reason.

## Return values

Return values should have predictable shapes.

Avoid functions that return unrelated types depending on hidden conditions.

Use discriminated unions when a result has several meaningful states.

Example:

```ts
type Result<TValue> =
  | { status: 'success'; value: TValue }
  | { status: 'error'; error: Error };
```

Do not create custom result wrappers when normal exceptions or ordinary return values are already appropriate.

## Async code

Use `async` and `await` when they make asynchronous flow easier to read.

Avoid unnecessary `Promise.resolve`, manual promise construction, or `.then()` chains when `async`/`await` is clearer.

Do not mark a function `async` if it does not need to be asynchronous.

Do not use:

```ts
return await value;
```

unless awaiting is required for local error handling, cleanup, stack behavior, or another concrete reason.

Run independent asynchronous operations concurrently when appropriate.

Do not serialize independent operations accidentally.

Do not use `Promise.all` when partial failure handling or sequencing matters.

Make concurrency deliberate.

## Error handling

Do not wrap every asynchronous function in `try/catch`.

Catch errors where the code can:

- recover;
- translate the error;
- add meaningful context;
- perform cleanup;
- map it to a boundary-specific response.

When catching unknown errors, narrow them safely.

Do not assume every caught value is an `Error`.

Avoid this unless the environment guarantees it:

```ts
catch (error) {
  console.error(error.message);
}
```

Prefer proper narrowing.

Do not create custom error classes unless they carry meaningful semantics or are used to distinguish failure categories.

## Generics

Use generics when the relationship between types matters.

Do not introduce generics only to make code look reusable.

Avoid deeply nested generic types that are harder to understand than the implementation they describe.

Name generic parameters by meaning when the type relationship is non-trivial.

Prefix all generic parameters with T, such as TValue, TKey, TMin, and TMax.

Prefer constraints that describe real requirements.

Do not use generic constraints merely to satisfy the compiler.

## Utility types

Use built-in utility types where they clearly express intent.

Examples:

```text
Pick
Omit
Partial
Required
Readonly
Record
ReturnType
Parameters
```

Do not compose utility types into unreadable type puzzles.

If a derived type becomes difficult to understand, give it a meaningful name or define the structure directly.

Avoid excessive reuse of `Partial<T>` for update operations when only a specific subset of fields is actually valid.

## Immutability

Prefer immutable data when mutation does not provide a clear benefit.

Do not clone objects reflexively.

Avoid repeated object spreading when it makes code noisy or inefficient without improving correctness.

Mutation is acceptable when it is local, obvious, and simpler.

Do not mutate shared state unexpectedly.

Use `readonly` where it meaningfully communicates a contract, especially for public APIs and values that should not be modified.

Do not apply `readonly` mechanically to every type.

## Collections

Use array methods when they make intent clearer.

Prefer:

```text
map
filter
find
some
every
reduce
```

when they naturally express the operation.

Do not force functional chains when a loop is clearer.

Avoid long chains that combine transformation, filtering, mutation, and side effects.

A straightforward loop is often better than an unreadable sequence of array operations.

Use `reduce` when it genuinely represents accumulation.

Do not use `reduce` as a generic substitute for every loop.

## Loops and conditions

Keep control flow visually clear.

Separate setup from loops.

Separate loops from subsequent processing when they represent different stages.

Prefer:

```ts
const result: UserView[] = [];

for (const user of users) {
  if (!user.active) {
    continue;
  }

  result.push(buildUserView(user));
}

return result;
```

over dense control flow with no visible structure.

Avoid deeply nested conditions.

Use guard clauses or `continue` when they make the main path easier to follow.

Do not flatten logic mechanically if doing so makes behavior harder to understand.

## Destructuring

Use destructuring when it improves readability.

Do not destructure deeply nested objects merely because TypeScript supports it.

Avoid destructuring large objects into many local variables when keeping the object name provides useful context.

Preserve semantic context.

## Optional chaining and nullish coalescing

Use optional chaining for genuinely optional paths.

Do not use it to hide unexpected missing values.

Use `??` when only `null` and `undefined` should trigger the fallback.

Do not use `||` as a fallback when valid values such as `0`, `false`, or an empty string must be preserved.

## Constants

Use named constants when a value has domain meaning or is reused.

Do not extract every literal into a constant.

Keep constants close to their usage unless they are genuinely shared.

Use uppercase constant naming only when it matches the project's conventions and the value represents a true constant.

Do not create a global constants file as a dumping ground.

## Comments and JSDoc

Follow the global rule that comments should be rare.

When the user explicitly invokes a public-API documentation task, document all public declarations in the selected file, including small ones. This task-scoped exception does not require blanket JSDoc during ordinary development. Use concise English behavior descriptions, no redundant type, parameter, or return tags, and examples only where they clarify complex usage.

Do not add JSDoc to obvious functions merely to repeat their signature.

Use JSDoc when it provides information the type system cannot express clearly.

Examples include:

- behavior constraints;
- external protocol requirements;
- non-obvious side effects;
- compatibility notes;
- important usage expectations.

Do not document parameters and return values that are already obvious from names and types.

Prefer whitespace, naming, and structure over section comments inside functions and classes.
