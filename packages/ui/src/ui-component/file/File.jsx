import { useState } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { FormControl, Button, Stack, Typography, Switch, FormControlLabel } from '@mui/material'
import { IconUpload, IconFolderUp } from '@tabler/icons-react'
import { getFileName } from '@/utils/genericHelper'

export const File = ({ value, formDataUpload, fileType, onChange, onFormDataChange, disabled = false }) => {
    const theme = useTheme()
    const [myValue, setMyValue] = useState(value ?? '')
    const [isFolderMode, setIsFolderMode] = useState(false)

    const handleFileUpload = async (e) => {
        if (!e.target.files) return

        if (e.target.files.length === 1) {
            const file = e.target.files[0]
            const { name } = file

            const reader = new FileReader()
            reader.onload = (evt) => {
                if (!evt?.target?.result) {
                    return
                }
                const { result } = evt.target

                const value = result + `,filename:${name}`

                setMyValue(value)
                onChange(value)
            }
            reader.readAsDataURL(file)
        } else if (e.target.files.length > 0) {
            let files = Array.from(e.target.files).map((file) => {
                const reader = new FileReader()
                const { name } = file

                return new Promise((resolve) => {
                    reader.onload = (evt) => {
                        if (!evt?.target?.result) {
                            return
                        }
                        const { result } = evt.target
                        const value = result + `,filename:${name}`
                        resolve(value)
                    }
                    reader.readAsDataURL(file)
                })
            })

            const res = await Promise.all(files)
            setMyValue(JSON.stringify(res))
            onChange(JSON.stringify(res))
        }
    }

    const handleFormDataUpload = async (e) => {
        if (!e.target.files) return

        if (e.target.files.length === 1 && !isFolderMode) {
            const file = e.target.files[0]
            const { name } = file
            const formData = new FormData()
            formData.append('files', file)
            setMyValue(`,filename:${name}`)
            onChange(`,filename:${name}`)
            onFormDataChange(formData)
        } else if (e.target.files.length > 0) {
            const formData = new FormData()
            const values = []

            // Process files, preserving folder structure if in folder mode
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i]

                if (isFolderMode) {
                    // For folder uploads, we want to preserve the relative path
                    // webkitRelativePath contains the relative path including the filename
                    const relativePath = file.webkitRelativePath || file.name
                    formData.append('files', file)

                    // Store the relative path in the form data for server-side processing
                    formData.append('filePaths', relativePath)
                    values.push(`,filename:${relativePath}`)
                } else {
                    formData.append('files', file)
                    values.push(`,filename:${file.name}`)
                }
            }

            // Add a flag to indicate this is a folder upload
            if (isFolderMode) {
                formData.append('isFolder', 'true')
            }

            setMyValue(JSON.stringify(values))
            onChange(JSON.stringify(values))
            onFormDataChange(formData)
        }
    }

    const toggleFolderMode = () => {
        setIsFolderMode(!isFolderMode)
    }

    return (
        <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
            {!formDataUpload && (
                <span
                    style={{
                        fontStyle: 'italic',
                        color: theme.palette.grey['800'],
                        marginBottom: '1rem'
                    }}
                >
                    {myValue ? getFileName(myValue) : 'Choose a file to upload'}
                </span>
            )}

            <Stack spacing={1} direction='column' sx={{ mb: 1 }}>
                <FormControlLabel control={<Switch checked={isFolderMode} onChange={toggleFolderMode} />} label='Upload Folder' />

                {isFolderMode && (
                    <Typography variant='caption' color='text.secondary'>
                        Select a folder to upload all files within it
                    </Typography>
                )}
            </Stack>

            <Button
                disabled={disabled}
                variant='outlined'
                component='label'
                fullWidth
                startIcon={isFolderMode ? <IconFolderUp /> : <IconUpload />}
                sx={{ marginRight: '1rem' }}
            >
                {isFolderMode ? 'Upload Folder' : 'Upload File'}
                <input
                    type='file'
                    multiple={!isFolderMode}
                    accept={fileType}
                    hidden
                    {...(isFolderMode ? { webkitdirectory: '', directory: '' } : {})}
                    onChange={(e) => (formDataUpload ? handleFormDataUpload(e) : handleFileUpload(e))}
                />
            </Button>
        </FormControl>
    )
}

File.propTypes = {
    value: PropTypes.string,
    fileType: PropTypes.string,
    formDataUpload: PropTypes.bool,
    onChange: PropTypes.func,
    onFormDataChange: PropTypes.func,
    disabled: PropTypes.bool
}
