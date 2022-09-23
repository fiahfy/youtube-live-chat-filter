import { Box, CssBaseline, GlobalStyles } from '@mui/material'
import { StoreProvider } from '~/contexts/StoreContext'

const InnerApp = () => {
  return <Box sx={{ m: 1 }}></Box>
}

const App = () => {
  return (
    <StoreProvider>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { overflowY: 'hidden', width: 640 },
        }}
      />
      <InnerApp />
    </StoreProvider>
  )
}

export default App
