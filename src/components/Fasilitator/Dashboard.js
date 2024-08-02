import { compareEmployeesSimasterSiasn } from '@/services/master.services';
import { useQuery } from '@tanstack/react-query'
import React from 'react'

function Dashboard() {
    const { data, isLoading } = useQuery(
      ["dashboard-compare-siasn"],
      () => compareEmployeesSimasterSiasn()
    );
    return (
      <pre>
        {JSON.stringify(data)}
      </pre>
  )
}

export default Dashboard
