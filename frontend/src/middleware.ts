import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔐 HTTP Basic Authentication
// Protege TODA a aplicação com senha

export function middleware(request: NextRequest) {
  // Pular autenticação em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Verificar se tem credenciais
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return new NextResponse('Acesso Restrito', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Clinic Companion - Acesso Restrito"',
      },
    })
  }

  // Validar credenciais
  const auth = authHeader.split(' ')[1]
  const [user, password] = Buffer.from(auth, 'base64').toString().split(':')

  // 🔑 DEFINA SUA SENHA AQUI (ou use variável de ambiente)
  const validUser = process.env.BASIC_AUTH_USER || 'admin'
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'senha-secreta-123'

  if (user === validUser && password === validPassword) {
    return NextResponse.next()
  }

  // Senha incorreta
  return new NextResponse('Credenciais Inválidas', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Clinic Companion - Acesso Restrito"',
    },
  })
}

// Aplicar em todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
