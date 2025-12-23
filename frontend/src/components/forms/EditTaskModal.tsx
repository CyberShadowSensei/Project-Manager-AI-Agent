import { Modal } from '../ui/Modal'
import { EditTaskForm } from './EditTaskForm'
import type { Task } from '../../services/api'

interface EditTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const EditTaskModal = ({ task, isOpen, onClose, onSuccess }: EditTaskModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <EditTaskForm task={task} onSuccess={onSuccess} onCancel={onClose} />
    </Modal>
  )
}

export default EditTaskModal
