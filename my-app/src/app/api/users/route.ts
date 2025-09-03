import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, roleId } = body;

    if (!email || !roleId) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Check if role exists
    const roleExists = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!roleExists) {
        // Seed roles if they don't exist
        await prisma.role.createMany({
            data: [
                { name: 'ADMIN' },
                { name: 'USER' },
            ],
            skipDuplicates: true,
        });
    }


    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: {
            connect: {
                id: roleId,
            }
        }
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
