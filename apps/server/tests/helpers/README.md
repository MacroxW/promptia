# Test Helpers - Generators con Faker

Este directorio contiene utilidades para generar datos de prueba usando `@faker-js/faker`.

## 📚 Generators Disponibles

### UserGenerator

Genera usuarios de prueba con datos realistas.

```typescript
import { UserGenerator } from './generators';

// Generar un usuario aleatorio
const user = UserGenerator.generate();

// Generar con overrides
const user = UserGenerator.generate({
  email: 'custom@example.com',
  name: 'Custom Name'
});

// Generar usuario con contraseña
const userWithPassword = UserGenerator.generateWithPassword();

// Generar múltiples usuarios
const users = UserGenerator.generateMany(10);

// Generar solo email
const email = UserGenerator.generateEmail();

// Generar solo nombre
const name = UserGenerator.generateName();
```

### SessionGenerator

Genera sesiones de chat con datos realistas.

```typescript
import { SessionGenerator } from './generators';

// Generar una sesión aleatoria
const session = SessionGenerator.generate();

// Generar con overrides
const session = SessionGenerator.generate({
  userId: 'specific-user-id',
  title: 'Custom Title'
});

// Generar múltiples sesiones
const sessions = SessionGenerator.generateMany(5);

// Generar sesión con mensajes
const sessionWithMessages = SessionGenerator.generateWithMessages(10);

// Generar solo título
const title = SessionGenerator.generateTitle();
```

### MessageGenerator

Genera mensajes de chat con contenido realista.

```typescript
import { MessageGenerator } from './generators';

// Generar un mensaje aleatorio
const message = MessageGenerator.generate();

// Generar mensaje de usuario
const userMessage = MessageGenerator.generateUserMessage({
  content: 'Hello, how are you?'
});

// Generar mensaje del agente
const agentMessage = MessageGenerator.generateAgentMessage();

// Generar múltiples mensajes
const messages = MessageGenerator.generateMany(20);

// Generar una conversación completa (pares usuario-agente)
const conversation = MessageGenerator.generateConversation(5); // 5 intercambios = 10 mensajes

// Generar contenido de diferentes longitudes
const shortContent = MessageGenerator.generateContent('short');
const mediumContent = MessageGenerator.generateContent('medium');
const longContent = MessageGenerator.generateContent('long');
```

### AuthGenerator

Genera datos de autenticación.

```typescript
import { AuthGenerator } from './generators';

// Generar credenciales de login
const credentials = AuthGenerator.generateLoginCredentials();
// { email: 'user@example.com', password: 'securepass123' }

// Generar datos de registro
const registerData = AuthGenerator.generateRegisterData();
// { email: 'user@example.com', password: 'securepass123', name: 'John Doe' }

// Generar token JWT mock
const token = AuthGenerator.generateToken();

// Generar respuesta de login completa
const loginResponse = AuthGenerator.generateLoginResponse();
// { token: '...', user: { ... } }
```

### IdGenerator

Genera IDs de MongoDB válidos.

```typescript
import { IdGenerator } from './generators';

// Generar un ObjectId
const id = IdGenerator.generate();

// Generar múltiples ObjectIds
const ids = IdGenerator.generateMany(10);
```

### DateGenerator

Genera fechas para tests.

```typescript
import { DateGenerator } from './generators';

// Fecha pasada (1 año por defecto)
const pastDate = DateGenerator.past();
const pastDate2Years = DateGenerator.past(2);

// Fecha reciente (últimos 7 días por defecto)
const recentDate = DateGenerator.recent();
const recent30Days = DateGenerator.recent(30);

// Fecha futura (1 año por defecto)
const futureDate = DateGenerator.future();
const future2Years = DateGenerator.future(2);

// Fecha en un rango específico
const rangeDate = DateGenerator.range(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

### TestDataGenerator

Genera conjuntos completos de datos relacionados.

```typescript
import { TestDataGenerator } from './generators';

// Generar dataset completo
const dataset = TestDataGenerator.generateFullDataset();
// {
//   users: User[],
//   sessions: Session[],
//   messages: Message[]
// }

// Generar usuario con sus datos relacionados
const userData = TestDataGenerator.generateUserWithData(3, 10);
// {
//   user: User,
//   sessions: Session[] // 3 sesiones con 10 mensajes cada una
// }
```

## 🎯 Uso en Tests

### Ejemplo Básico

```typescript
import { UserGenerator, SessionGenerator } from '../helpers/generators';

describe('UserService', () => {
  it('should create a user', async () => {
    // Arrange
    const userData = UserGenerator.generate();
    
    // Act
    const result = await userService.create(userData);
    
    // Assert
    expect(result.email).toBe(userData.email);
  });
});
```

### Tests Determinísticos

Para tests que necesitan datos consistentes:

```typescript
import { seedFaker, UserGenerator } from '../helpers/generators';

describe('Deterministic tests', () => {
  beforeEach(() => {
    seedFaker(12345); // Mismo seed = mismos datos
  });

  it('should generate same data', () => {
    const user1 = UserGenerator.generate();
    seedFaker(12345); // Reset seed
    const user2 = UserGenerator.generate();
    
    expect(user1.email).toBe(user2.email);
  });
});
```

### Generar Datos Relacionados

```typescript
import { UserGenerator, SessionGenerator, MessageGenerator } from '../helpers/generators';

describe('Session with messages', () => {
  it('should create session with messages', () => {
    // Generar usuario
    const user = UserGenerator.generate();
    
    // Generar sesión para ese usuario
    const session = SessionGenerator.generate({
      userId: user.id
    });
    
    // Generar conversación para esa sesión
    const messages = MessageGenerator.generateConversation(5, session.id);
    
    expect(messages).toHaveLength(10); // 5 intercambios = 10 mensajes
    expect(messages[0].sessionId).toBe(session.id);
  });
});
```

### Generar Múltiples Variaciones

```typescript
import { UserGenerator } from '../helpers/generators';

describe('Bulk operations', () => {
  it('should handle multiple users', () => {
    // Generar 100 usuarios diferentes
    const users = UserGenerator.generateMany(100);
    
    expect(users).toHaveLength(100);
    expect(new Set(users.map(u => u.email)).size).toBe(100); // Todos únicos
  });
});
```

## 🔧 Personalización

### Extender Generators

```typescript
import { UserGenerator } from '../helpers/generators';
import { faker } from '@faker-js/faker';

class CustomUserGenerator extends UserGenerator {
  static generateAdmin() {
    return this.generate({
      email: `admin.${faker.string.alphanumeric(5)}@company.com`,
      name: `Admin ${faker.person.lastName()}`
    });
  }
  
  static generateWithRole(role: string) {
    return {
      ...this.generate(),
      role
    };
  }
}
```

### Crear Generators Personalizados

```typescript
import { faker } from '@faker-js/faker';

export class CustomDataGenerator {
  static generateApiKey(): string {
    return `sk_${faker.string.alphanumeric(32)}`;
  }
  
  static generateWebhookUrl(): string {
    return `https://${faker.internet.domainName()}/webhook`;
  }
}
```

## 📋 Mejores Prácticas

### 1. Usar Generators en lugar de datos hardcodeados

```typescript
// ❌ Evitar
const user = {
  id: '123',
  email: 'test@test.com',
  name: 'Test'
};

// ✅ Mejor
const user = UserGenerator.generate();
```

### 2. Usar seedFaker para tests determinísticos

```typescript
// ✅ Tests predecibles
beforeEach(() => {
  seedFaker(12345);
});
```

### 3. Generar datos relacionados correctamente

```typescript
// ✅ Mantener relaciones
const user = UserGenerator.generate();
const session = SessionGenerator.generate({ userId: user.id });
const messages = MessageGenerator.generateConversation(5, session.id);
```

### 4. Usar overrides para casos específicos

```typescript
// ✅ Combinar datos aleatorios con específicos
const user = UserGenerator.generate({
  email: 'specific@example.com' // Email específico
  // Otros campos aleatorios
});
```

## 🎨 Ejemplos Avanzados

### Generar Dataset Completo para Tests de Integración

```typescript
import { TestDataGenerator } from '../helpers/generators';

describe('Integration tests', () => {
  let testData;
  
  beforeAll(() => {
    testData = TestDataGenerator.generateFullDataset();
  });
  
  it('should work with full dataset', () => {
    expect(testData.users).toHaveLength(5);
    expect(testData.sessions).toHaveLength(15); // 5 users * 3 sessions
    expect(testData.messages.length).toBeGreaterThan(0);
  });
});
```

### Generar Escenarios Específicos

```typescript
import { UserGenerator, SessionGenerator, MessageGenerator } from '../helpers/generators';

function generateChatScenario() {
  const user = UserGenerator.generate();
  const activeSessions = SessionGenerator.generateMany(3, { userId: user.id });
  const archivedSessions = SessionGenerator.generateMany(2, { 
    userId: user.id,
    // Agregar campo archived si existe en tu modelo
  });
  
  const sessionsWithMessages = activeSessions.map(session => ({
    ...session,
    messages: MessageGenerator.generateConversation(10, session.id)
  }));
  
  return {
    user,
    activeSessions: sessionsWithMessages,
    archivedSessions
  };
}
```

## 📚 Recursos

- [Faker.js Documentation](https://fakerjs.dev/)
- [Jest Testing Best Practices](https://jestjs.io/docs/getting-started)
- [Test Data Builders Pattern](https://www.arhohuttunen.com/test-data-builders/)
