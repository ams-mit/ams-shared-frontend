import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Announcement, AnnouncementRequest } from '../types/announcement.types';
import { announcementApi } from '../api/announcementApi';

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

export const fetchAnnouncements = createAsyncThunk<Announcement[], string | void>(
  'announcements/fetchAnnouncements',
  async (role, { rejectWithValue }) => {
    try {
      return await announcementApi.getAnnouncementsByRole(role || undefined);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch announcements');
    }
  }
);

export const publishAnnouncement = createAsyncThunk(
  'announcements/publishAnnouncement',
  async (request: AnnouncementRequest, { rejectWithValue }) => {
    try {
      return await announcementApi.publishAnnouncement(request);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to publish announcement');
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  'announcements/updateAnnouncement',
  async ({ id, request }: { id: number; request: Partial<AnnouncementRequest> }, { rejectWithValue }) => {
    try {
      return await announcementApi.updateAnnouncement(id, request);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update announcement');
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcements/deleteAnnouncement',
  async (id: number, { rejectWithValue }) => {
    try {
      await announcementApi.deleteAnnouncement(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  }
);

export const archiveAnnouncement = createAsyncThunk(
  'announcements/archiveAnnouncement',
  async (id: number, { rejectWithValue }) => {
    try {
      return await announcementApi.archiveAnnouncement(id);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to archive announcement');
    }
  }
);

export const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncementFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAnnouncements
    builder.addCase(fetchAnnouncements.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAnnouncements.fulfilled, (state, action: PayloadAction<Announcement[]>) => {
      state.loading = false;
      state.announcements = [...action.payload];
    });
    builder.addCase(fetchAnnouncements.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // publishAnnouncement
    builder.addCase(publishAnnouncement.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(publishAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
      state.actionLoading = false;
      state.announcements = [action.payload, ...state.announcements.filter((a) => a.id !== action.payload.id)];
      state.successMessage = `Notice "${action.payload.title}" published successfully for target audience: ${action.payload.targetRole}`;
    });
    builder.addCase(publishAnnouncement.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // updateAnnouncement
    builder.addCase(updateAnnouncement.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(updateAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
      state.actionLoading = false;
      state.announcements = state.announcements.map((a) => (a.id === action.payload.id ? action.payload : a));
      state.successMessage = `Notice "${action.payload.title}" updated successfully.`;
    });
    builder.addCase(updateAnnouncement.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // deleteAnnouncement
    builder.addCase(deleteAnnouncement.fulfilled, (state, action: PayloadAction<number>) => {
      state.announcements = state.announcements.filter((a) => a.id !== action.payload);
      state.successMessage = 'Notice deleted successfully.';
    });

    // archiveAnnouncement
    builder.addCase(archiveAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
      state.announcements = state.announcements.map((a) => (a.id === action.payload.id ? action.payload : a));
      state.successMessage = `Notice "${action.payload.title}" archived successfully.`;
    });
  },
});

export const { clearAnnouncementFeedback } = announcementSlice.actions;
export default announcementSlice.reducer;
