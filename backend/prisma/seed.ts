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
        'Customers cannot complete checkout. The payment step fails with a servers error.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      customerId: customer.id,
      assigneeId: agent.id,
      comments: {
        create: [
          {
            message:
              'This is blocking our customers. Please investigate urgently.',
            authorId: agent.id,
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

  console.log('Seed completed successfully.');
  console.log({
    users: {
      admin: admin.email,
      agent: agent.email,
      customer: customer.email,
    },
    tickets: [
      loginIssue.title,
      billingQuestion.title,
      urgentOutage.title,
      unassignedTicket.title,
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
