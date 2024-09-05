import {Button, ButtonGroup} from "@chakra-ui/react"

interface PaginationButtonsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}
export function PaginationButtons({page, totalPages, onPageChange}: PaginationButtonsProps) {
  const buildPagesArray = (count: number) => {
    // ex: count 3 returns [1, 2, 3]
    return Array(count)
      .fill(null)
      .map((_value, index) => index + 1)
  }

  return (
    <ButtonGroup isAttached>
      {buildPagesArray(totalPages).map((pageNumber) => {
        return (
          <Button
            variant="outline"
            onClick={() => onPageChange(pageNumber)}
            isActive={pageNumber === page}
            key={pageNumber}
          >
            {pageNumber}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
