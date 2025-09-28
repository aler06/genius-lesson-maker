import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SessionDebuggerProps {
  sessionData?: any;
  currentUser?: any;
  accessCode?: string;
  connectionStatus?: string;
  isJoined?: boolean;
  sessionId?: string;
}

const SessionDebugger: React.FC<SessionDebuggerProps> = ({
  sessionData,
  currentUser,
  accessCode,
  connectionStatus,
  isJoined,
  sessionId,
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    console.log(`📋 Copied ${label}:`, text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card className="mb-4 border-dashed border-orange-300 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
          🐛 Session Debugger
          <Badge variant="outline" className="text-xs">
            DEV ONLY
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">WebSocket:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus || 'disconnected')}
            <span className="text-xs">{connectionStatus || 'disconnected'}</span>
          </div>
        </div>

        {/* Session Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Session Joined:</span>
          <div className="flex items-center gap-2">
            {isJoined ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs">{isJoined ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {/* Session ID */}
        {sessionId && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Session ID:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                {sessionId}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(sessionId, 'Session ID')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Access Code */}
        {accessCode && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Access Code:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {accessCode}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(accessCode, 'Access Code')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Current User */}
        {currentUser && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Current User:</span>
            <div className="text-xs bg-gray-100 p-2 rounded">
              <div><strong>ID:</strong> {currentUser.id || currentUser._id}</div>
              <div><strong>Name:</strong> {currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`}</div>
              <div><strong>Type:</strong> {currentUser.isTemporary ? 'Temporary' : 'Registered'}</div>
              <div><strong>Role:</strong> {currentUser.role}</div>
            </div>
          </div>
        )}

        {/* Session Data */}
        {sessionData && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Session Data:</span>
            <div className="text-xs bg-gray-100 p-2 rounded">
              <div><strong>Name:</strong> {sessionData.name}</div>
              <div><strong>Status:</strong> {sessionData.status}</div>
              <div><strong>Teacher:</strong> {sessionData.teacher?.firstName} {sessionData.teacher?.lastName}</div>
              <div><strong>Exercise:</strong> {sessionData.exercise?.game}</div>
            </div>
          </div>
        )}

        {/* Debug Actions */}
        <div className="pt-2 border-t border-orange-200">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => {
                console.log('🐛 Debug Info:', {
                  sessionData,
                  currentUser,
                  accessCode,
                  connectionStatus,
                  isJoined,
                  sessionId,
                });
              }}
            >
              Log All Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => {
                const debugData = {
                  sessionId,
                  userId: currentUser?.id || currentUser?._id,
                  accessCode,
                  timestamp: new Date().toISOString(),
                };
                copyToClipboard(JSON.stringify(debugData, null, 2), 'Debug Data');
              }}
            >
              Copy Debug Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionDebugger;
