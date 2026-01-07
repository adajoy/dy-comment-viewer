import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import prisma from '../db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { InterestedUser } from '../../generated/client'
import { useState } from 'react'

const getInterestedUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const users = await prisma.interestedUser.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  console.log(users)
  return users
})

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => {
    const users = await getInterestedUsers()
    return { users }
  },
})

function App() {
  const { users } = Route.useLoaderData()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calculate pagination
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-3xl font-black mb-4">
            评论列表
          </h3>

          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="font-semibold">内容</TableHead>
                  <TableHead className="font-semibold">创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      暂无评论
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user: InterestedUser) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {user.content}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {users.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t flex-col-reverse sm:flex-row gap-2">
                <div className="text-sm text-muted-foreground">
                  显示第 {startIndex + 1} 到 {Math.min(endIndex, users.length)} 项，共 {users.length} 项
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <Button
                          key={index}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageClick(page)}
                        >
                          {page}
                        </Button>
                      ) : (
                        <span key={index} className="px-2 text-muted-foreground">
                          {page}
                        </span>
                      )
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
