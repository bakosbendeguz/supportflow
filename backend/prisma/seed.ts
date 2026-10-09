import {
  PrismaClient,
  Role,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordSaltRounds = 10;

  const adminPasswordHash = await bcrypt.hash('admin123', passwordSaltRounds);
  const agentPasswordHash = await bcrypt.hash('agent123', passwordSaltRounds);
  const customerPasswordHash = await bcrypt.hash(
    'customer123',
    passwordSaltRounds,
  );

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      name: 'Admin user',
      role: Role.ADMIN,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      passwordHash: agentPasswordHash,
      name: 'Agent User',
      role: Role.AGENT,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@example.com' },
    update: {},
    create: {
      email: 'agent2@example.com',
      passwordHash: agentPasswordHash,
      name: 'Agent Two',
      role: Role.AGENT,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPasswordHash,
      name: 'Customer User',
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      email: 'customer2@example.com',
      passwordHash: customerPasswordHash,
      name: 'Customer Two',
      role: Role.CUSTOMER,
    },
  });

  const loginIssue = await prisma.ticket.create({
    data: {
      title: 'Cannot log in to my account',
      description:
        'I tried to log in several times, but the application says my credentials are invalid.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer.id,
      assigneeId: agent.id,
      comments: {
        create: [
          {
            message: 'I cannot access my account, Can someone help?',
            authorId: customer.id,
          },
          {
            message: 'I will check the account status and login logs.',
            authorId: agent.id,
          },
        ],
      },
    },
  });

  const billingQuestion = await prisma.ticket.create({
    data: {
      title: 'Question about invoice',
      description:
        'I need clarification about the latest invoice amount and billing period.',
      status: TicketStatus.WAITING_FOR_CUSTOMER,
      priority: TicketPriority.MEDIUM,
      customerId: customer.id,
      assigneeId: agent.id,
      comments: {
        create: [
          {
            message: 'Could you explain the invoice total?',
            authorId: customer.id,
          },
          {
            message:
              'I reviewed the invoice. Could you confirm which billing period you mean?',
            authorId: agent.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer.id,
          },
          {
            oldStatus: TicketStatus.OPEN,
            newStatus: TicketStatus.WAITING_FOR_CUSTOMER,
            changedById: agent.id,
          },
        ],
      },
    },
  });

  const urgentOutage = await prisma.ticket.create({
    data: {
      title: 'Production checkout is failing',
      description:
        'Customers cannot complete checkout. The payment step fails with a server error.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      customerId: customer.id,
      assigneeId: agent.id,
      comments: {
        create: [
          {
            message:
              'Checkout is failing for multiple orders and we are losing sales. Please investigate urgently.',
            authorId: customer.id,
          },
          {
            message:
              'I reproduced the issue and escalated it to the engineering team.',
            authorId: agent.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer.id,
          },
          {
            oldStatus: TicketStatus.OPEN,
            newStatus: TicketStatus.IN_PROGRESS,
            changedById: agent.id,
          },
        ],
      },
    },
  });

  const unassignedTicket = await prisma.ticket.create({
    data: {
      title: 'Feature request: export tickets',
      description:
        'It would be helpful to export ticket lists as a CSV for reporting.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      customerId: customer.id,
      comments: {
        create: [
          {
            message: 'Can you add CSV export in the future?',
            authorId: customer.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer.id,
          },
        ],
      },
    },
  });

  const passwordResetTicket = await prisma.ticket.create({
    data: {
      title: 'Password reset email not received',
      description:
        'I requested a password reset several times but no reset email has arrived.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customerId: customer2.id,
      comments: {
        create: [
          {
            message:
              'I checked my spam folder as well, but I still cannot find the email.',
            authorId: customer2.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer2.id,
          },
        ],
      },
    },
  });

  const ssoTicket = await prisma.ticket.create({
    data: {
      title: 'SSO configuration fails for new users',
      description:
        'New employees receive an authentication error when signing in through our SSO provider.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      customerId: customer2.id,
      assigneeId: agent2.id,
      comments: {
        create: [
          {
            message: 'The problem affects all users created this week.',
            authorId: customer2.id,
          },
          {
            message:
              'I am reviewing the identity provider configuration and authentication logs.',
            authorId: agent2.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer2.id,
          },
          {
            oldStatus: TicketStatus.OPEN,
            newStatus: TicketStatus.IN_PROGRESS,
            changedById: agent2.id,
          },
        ],
      },
    },
  });

  const notificationTicket = await prisma.ticket.create({
    data: {
      title: 'Mobile notifications arrive late',
      description:
        'Ticket update notifications on the mobile app are sometimes delayed by several minutes.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      customerId: customer.id,
      assigneeId: agent2.id,
      comments: {
        create: [
          {
            message: 'The delay seems to happen mostly in the evening.',
            authorId: customer.id,
          },
          {
            message:
              'We identified a delayed background job and deployed a fix.',
            authorId: agent2.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer.id,
          },
          {
            oldStatus: TicketStatus.OPEN,
            newStatus: TicketStatus.IN_PROGRESS,
            changedById: agent2.id,
          },
          {
            oldStatus: TicketStatus.IN_PROGRESS,
            newStatus: TicketStatus.RESOLVED,
            changedById: agent2.id,
          },
        ],
      },
    },
  });

  const rateLimitTicket = await prisma.ticket.create({
    data: {
      title: 'Question about API rate limits',
      description:
        'We need clarification about the API request limits before increasing our integration traffic.',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.MEDIUM,
      customerId: customer2.id,
      assigneeId: agent.id,
      comments: {
        create: [
          {
            message:
              'Could you confirm the request limit applied to our account?',
            authorId: customer2.id,
          },
          {
            message:
              'The limits were confirmed and the customer has the required information.',
            authorId: agent.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer2.id,
          },
          {
            oldStatus: TicketStatus.OPEN,
            newStatus: TicketStatus.RESOLVED,
            changedById: agent.id,
          },
          {
            oldStatus: TicketStatus.RESOLVED,
            newStatus: TicketStatus.CLOSED,
            changedById: agent.id,
          },
        ],
      },
    },
  });

  const exportDataTicket = await prisma.ticket.create({
    data: {
      title: 'Export is missing recent records',
      description:
        'The CSV export finishes successfully, but some records created today are missing from the file.',
      status: TicketStatus.WAITING_FOR_CUSTOMER,
      priority: TicketPriority.HIGH,
      customerId: customer2.id,
      comments: {
        create: [
          {
            message:
              'The export contains older records but not several records created today.',
            authorId: customer2.id,
          },
          {
            message:
              'Please confirm the date range and filters selected when generating the export.',
            authorId: agent.id,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            oldStatus: null,
            newStatus: TicketStatus.OPEN,
            changedById: customer2.id,
          },
          {
            oldStatus: TicketStatus.OPEN,
            newStatus: TicketStatus.WAITING_FOR_CUSTOMER,
            changedById: agent.id,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully.');
  console.log({
    users: {
      admin: admin.email,
      agent: agent.email,
      agent2: agent2.email,
      customer: customer.email,
      customer2: customer2.email,
    },
    tickets: [
      loginIssue.title,
      billingQuestion.title,
      urgentOutage.title,
      unassignedTicket.title,
      passwordResetTicket.title,
      ssoTicket.title,
      notificationTicket.title,
      rateLimitTicket.title,
      exportDataTicket.title,
    ],
  });
}

main()
  .catch((error) => {
    console.error('Seed failed.');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
